const express = require("express");
const router = express.Router();
const recipesController = require("../controllers/recipesController");
const authMiddleware = require("../middleware/auth"); // vérifie JWT
const adminMiddleware = require("../middleware/admin"); // vérifie rôle admin

// Routes publiques
router.get("/", recipesController.getAll);
router.get("/:id", recipesController.getOne);

// Routes admin
router.post("/", authMiddleware, adminMiddleware, recipesController.create);
router.patch("/:id", authMiddleware, adminMiddleware, recipesController.update);
router.delete("/:id", authMiddleware, adminMiddleware, recipesController.delete);

module.exports = router;
