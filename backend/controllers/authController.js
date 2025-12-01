const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Inscription
exports.register = async (req, res) => {
    const { username, email, password, role = "user" } = req.body;

    // Validation simple
    if (!username || !email || !password) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Le mot de passe doit faire au moins 6 caractères" });
    }

    if (!email.includes("@")) {
        return res.status(400).json({ message: "Email invalide" });
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
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
        const [newUser] = await pool.query("SELECT id, username, email, role FROM users WHERE id = ?", [result.insertId]);
        
        // Générer un token JWT avec id et role
        const token = jwt.sign({ id: newUser[0].id, role: newUser[0].role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ message: "Utilisateur créé", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
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
        const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (!users.length) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Connexion réussie", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Récupérer les infos de l'utilisateur connecté
exports.me = async (req, res) => {
    try {
        const [users] = await pool.query("SELECT id, username, email, role FROM users WHERE id = ?", [req.user.id]);
        if (!users.length) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.json(users[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Mettre à jour les infos de l'utilisateur connecté
exports.updateMe = async (req, res) => {
    const userId = req.user.id;
    const { username, email, password } = req.body;

    if (!username || !email) {
        return res.status(400).json({ message: "Nom d'utilisateur et email sont requis" });
    }

    try {
        // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
        const [existing] = await pool.query(
            "SELECT id FROM users WHERE email = ? AND id <> ?",
            [email, userId]
        );
        if (existing.length) {
            return res.status(400).json({ message: "Cet email est déjà utilisé par un autre compte" });
        }

        // Construire dynamiquement la requête UPDATE
        let sql = "UPDATE users SET username = ?, email = ?";
        const params = [username, email];

        if (password && password.trim() !== "") {
            if (password.length < 6) {
                return res.status(400).json({ message: "Le mot de passe doit faire au moins 6 caractères" });
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

        res.json(users[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
