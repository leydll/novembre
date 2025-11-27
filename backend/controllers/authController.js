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

        // Générer un token JWT
        const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: "1h" });

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

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Connexion réussie", token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
