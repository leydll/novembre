const express = require("express");
const router = express.Router();
const recipesController = require("../controllers/recipesController");
const authMiddleware = require("../middlewares/authMiddleware"); // vérifie JWT
const adminMiddleware = require("../middlewares/admin"); // vérifie rôle admin
const {
  validateCreateRecipe,
  validateUpdateRecipe,
} = require("../middlewares/validators");
const { validationResult } = require("express-validator");

// Middleware générique pour renvoyer proprement les erreurs de validation
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes publiques
router.get("/", recipesController.getAll);

// Routes likes (utilisateur connecté)
router.get("/:id/like", authMiddleware, recipesController.isLiked);
router.post("/:id/like", authMiddleware, recipesController.like);
router.delete("/:id/like", authMiddleware, recipesController.unlike);

// Route détail recette
router.get("/:id", recipesController.getOne);

// Routes admin
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validateCreateRecipe,
  handleValidation,
  recipesController.create
);
router.patch(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateUpdateRecipe,
  handleValidation,
  recipesController.update
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  recipesController.delete
);

module.exports = router;
