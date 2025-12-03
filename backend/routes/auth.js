const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/admin");
const { validateRegister, validateLogin, validateUpdateProfile } = require("../middlewares/validators");
const { validationResult } = require("express-validator");

// Middleware générique pour renvoyer proprement les erreurs de validation
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post("/register", validateRegister, handleValidation, authController.register);
router.post("/login", validateLogin, handleValidation, authController.login);
router.get("/me", authMiddleware, authController.me);
router.patch("/me", authMiddleware, validateUpdateProfile, handleValidation, authController.updateMe);

// Routes admin pour la gestion des utilisateurs
router.get("/users", authMiddleware, adminMiddleware, authController.getAllUsers);
router.delete("/users/:id", authMiddleware, adminMiddleware, authController.deleteUser);

// Routes pour la description du site
router.get("/site/description", authController.getSiteDescription);
router.patch("/site/description", authMiddleware, adminMiddleware, authController.updateSiteDescription);

// Déconnexion : on efface le cookie JWT (auth)
router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res
    .clearCookie("auth", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "Strict" : "Lax",
    })
    .status(200)
    .json({ message: "Déconnecté" });
});

module.exports = router;
