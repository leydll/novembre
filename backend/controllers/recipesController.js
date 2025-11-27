const pool = require("../config/database");

// méthode pour récupérer toutes les recettes
exports.getAll = async (req, res) => {
  try {
    const [recipes] = await pool.query("SELECT * FROM recipes");
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// métgode pour récupérer une recette en fonction de son id
exports.getOne = async (req, res) => {
  const { id } = req.params;
  try {
    const [recipe] = await pool.query("SELECT * FROM recipes WHERE id = ?", [id]);
    if (!recipe.length) return res.status(404).json({ message: "Recette non trouvée" });
    res.json(recipe[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// methode pour ajouter une recette (uniquement l'admin)
exports.create = async (req, res) => {
  const { title, description, image } = req.body;
  const userId = req.user.id; // récupéré via middleware auth/admin
  try {
    const [result] = await pool.query(
      "INSERT INTO recipes (title, description, image, user_id) VALUES (?, ?, ?, ?)",
      [title, description, image, userId]
    );
    res.status(201).json({ message: "Recette créée", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /recipes/:id (admin)
exports.update = async (req, res) => {
  const { id } = req.params;
  const { title, description, image } = req.body;
  try {
    await pool.query(
      "UPDATE recipes SET title=?, description=?, image=? WHERE id=?",
      [title, description, image, id]
    );
    res.json({ message: "Recette mise à jour" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /recipes/:id (admin)
exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM recipes WHERE id=?", [id]);
    res.json({ message: "Recette supprimée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
