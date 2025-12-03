const pool = require("../config/database");

// Récupérer toutes les recettes (avec compteur de likes) + recherche optionnelle
exports.getAll = async (req, res) => {
  try {
    const { q } = req.query;

    let sql = `
      SELECT r.*,
        (SELECT COUNT(*) FROM recipe_likes rl WHERE rl.recipe_id = r.id) AS likes_count
      FROM recipes r
    `;
    const params = [];

    if (q && q.trim() !== "") {
      sql += " WHERE r.title LIKE ? OR r.description LIKE ?";
      const like = `%${q}%`;
      params.push(like, like);
    }

    const [recipes] = await pool.query(sql, params);
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "erreur serveur" });
  }
};

// Récupérer une recette par ID (avec compteur de likes)
exports.getOne = async (req, res) => {
  try {
    const [recipes] = await pool.query(
      `SELECT r.*,
        (SELECT COUNT(*) FROM recipe_likes rl WHERE rl.recipe_id = r.id) AS likes_count
       FROM recipes r
       WHERE r.id = ?`,
      [req.params.id]
    );
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
    await pool.query(
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
    await pool.query("DELETE FROM recipes WHERE id=?", [req.params.id]);
    res.json({ message: "recette supprimée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "erreur serveur" });
  }
};

// Liker une recette
exports.like = async (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.id;

  try {
    // Empêcher les doublons (un like par user/recette)
    await pool.query(
      "INSERT IGNORE INTO recipe_likes (user_id, recipe_id) VALUES (?, ?)",
      [userId, recipeId]
    );
    res.status(201).json({ message: "like ajouté" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "erreur serveur" });
  }
};

// Retirer un like
exports.unlike = async (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.id;

  try {
    await pool.query(
      "DELETE FROM recipe_likes WHERE user_id = ? AND recipe_id = ?",
      [userId, recipeId]
    );
    res.json({ message: "like retiré" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "erreur serveur" });
  }
};

// Vérifier si l'utilisateur courant a liké une recette
exports.isLiked = async (req, res) => {
  const userId = req.user.id;
  const recipeId = req.params.id;

  try {
    const [rows] = await pool.query(
      "SELECT 1 FROM recipe_likes WHERE user_id = ? AND recipe_id = ? LIMIT 1",
      [userId, recipeId]
    );
    res.json({ liked: rows.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "erreur serveur" });
  }
};
