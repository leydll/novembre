const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const handleServerError = (res, err) => {
  console.error(err);
  return res.status(500).json({ message: "Erreur serveur" });
};

// Inscription
exports.register = async (req, res) => {
  const { username, email, password, role = "user" } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length) {
      return res.status(400).json({ message: "Email déjà existant" });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, role]
    );

    // Récupérer l'utilisateur créé avec son role
    const [newUser] = await pool.query(
      "SELECT id, username, email, role FROM users WHERE id = ?",
      [result.insertId]
    );

    // Générer un token JWT avec id et role
    const token = jwt.sign(
      { id: newUser[0].id, role: newUser[0].role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Déposer le token dans un cookie HttpOnly + Secure + SameSite
    const isProd = process.env.NODE_ENV === "production";
    return res
      .cookie("auth", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "Strict" : "Lax",
        maxAge: 60 * 60 * 1000, // 1h
      })
      .status(201)
      .json({ message: "Utilisateur créé", token });
  } catch (err) {
    return handleServerError(res, err);
  }
};

// Connexion
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validation simple
  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!users.length) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const isProd =
      process.env.NODE_ENV !== "test" && process.env.NODE_ENV === "production";
    return res
      .cookie("auth", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "Strict" : "Lax",
        maxAge: 60 * 60 * 1000,
      })
      .status(200)
      .json({ message: "Connexion réussie", token });
  } catch (err) {
    return handleServerError(res, err);
  }
};

// Récupérer les infos de l'utilisateur connecté
exports.me = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, username, email, role FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!users.length) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    return res.json(users[0]);
  } catch (err) {
    return handleServerError(res, err);
  }
};

// Mettre à jour les infos de l'utilisateur connecté
exports.updateMe = async (req, res) => {
  const userId = req.user.id;
  const { username, email, password } = req.body;

  try {
    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? AND id <> ?",
      [email, userId]
    );
    if (existing.length) {
      return res
        .status(400)
        .json({ message: "Cet email est déjà utilisé par un autre compte" });
    }

    // Construire dynamiquement la requête UPDATE
    let sql = "UPDATE users SET username = ?, email = ?";
    const params = [username, email];

    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          message: "Le mot de passe doit faire au moins 6 caractères",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      sql += ", password = ?";
      params.push(hashedPassword);
    }

    sql += " WHERE id = ?";
    params.push(userId);

    await pool.query(sql, params);

    // Renvoyer les infos mises à jour
    const [users] = await pool.query(
      "SELECT id, username, email, role FROM users WHERE id = ?",
      [userId]
    );

    return res.json(users[0]);
  } catch (err) {
    return handleServerError(res, err);
  }
};

// Récupérer tous les utilisateurs (admin seulement)
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, username, email, role FROM users ORDER BY id DESC"
    );
    return res.json(users);
  } catch (err) {
    return handleServerError(res, err);
  }
};

// Supprimer un utilisateur (admin seulement)
exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    // Empêcher la suppression de soi-même
    if (Number.parseInt(userId) === req.user.id) {
      return res
        .status(400)
        .json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
    }

    await pool.query("DELETE FROM users WHERE id = ?", [userId]);
    return res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    return handleServerError(res, err);
  }
};

// Récupérer la description du site (publique)
exports.getSiteDescription = async (req, res) => {
  try {
    // Vérifier si la table existe, sinon retourner la valeur par défaut
    try {
      const [rows] = await pool.query(
        "SELECT value FROM site_settings WHERE key_name = 'description' LIMIT 1"
      );
      if (rows.length) {
        return res.json({ description: rows[0].value });
      }
    } catch (tableErr) {
      // Si la table n'existe pas, retourner la valeur par défaut
      console.log(
        "Table site_settings n'existe pas encore, utilisation de la valeur par défaut"
      );
    }
    // Valeur par défaut
    return res.json({
      description:
        "Bienvenue sur bakesomecaakes, votre destination gourmande pour découvrir et partager les meilleures recettes de pâtisserie ! Que vous soyez débutant ou pâtissier confirmé, vous trouverez ici des recettes détaillées, des conseils pratiques et une communauté passionnée par l'art de la pâtisserie. Explorez nos recettes, créez vos propres créations et partagez vos expériences avec d'autres amateurs de douceurs.",
    });
  } catch (err) {
    console.error("Erreur getSiteDescription:", err);
    return handleServerError(res, err);
  }
};

// Mettre à jour la description du site (admin seulement)
exports.updateSiteDescription = async (req, res) => {
  const { description } = req.body;

  if (!description || typeof description !== "string") {
    return res.status(400).json({ message: "La description est requise" });
  }

  try {
    // Créer la table si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Vérifier si la clé existe
    const [existing] = await pool.query(
      "SELECT id FROM site_settings WHERE key_name = 'description' LIMIT 1"
    );

    if (existing.length) {
      await pool.query(
        "UPDATE site_settings SET value = ? WHERE key_name = 'description'",
        [description]
      );
    } else {
      await pool.query(
        "INSERT INTO site_settings (key_name, value) VALUES ('description', ?)",
        [description]
      );
    }

    return res.json({ message: "Description mise à jour", description });
  } catch (err) {
    console.error("Erreur updateSiteDescription:", err);
    return handleServerError(res, err);
  }
};
