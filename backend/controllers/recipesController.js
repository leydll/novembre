const pool = require("../config/database");

// Récupérer toutes les recettes
exports.getAll = async (req, res) => {
  try {
    const [recipes] = await pool.query("SELECT * FROM recipes");
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "erreur serveur" });
  }
};

// Récupérer une recette par ID
exports.getOne = async (req, res) => {
  try {
    const [recipes] = await pool.query("SELECT * FROM recipes WHERE id = ?", [req.params.id]);
    if (!recipes.length) return res.status(404).json({ message: "recette non trouvée" });
    res.json(recipes[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "erreur serveur" });
  }
};

// Créer une recette (admin)
exports.create = async (req, res) => {
  const { title, description, image, ingredients, steps, user_id } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO recipes (title, description, image, ingredients, steps, user_id) VALUES (?, ?, ?, ?, ?, ?)",
      [title, description, image, ingredients, steps, user_id]
    );
    res.status(201).json({ message: "recette créée", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "erreur serveur" });
  }
};

// Mettre à jour une recette (admin)
exports.update = async (req, res) => {
  const { title, description, image, ingredients, steps } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE recipes SET title=?, description=?, image=?, ingredients=?, steps=? WHERE id=?",
      [title, description, image, ingredients, steps, req.params.id]
    );
    res.json({ message: "recette mise à jour" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "erreur serveur" });
  }
};

// Supprimer une recette (admin)
exports.delete = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM recipes WHERE id=?", [req.params.id]);
    res.json({ message: "recette supprimée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "erreur serveur" });
  }
};
