const { body } = require("express-validator");

// Auth
exports.validateRegister = [
  body("username")
    .trim()
    .notEmpty().withMessage("Le nom d'utilisateur est requis")
    .isLength({ min: 3, max: 50 }).withMessage("Le nom d'utilisateur doit contenir entre 3 et 50 caractères"),
  body("email")
    .trim()
    .notEmpty().withMessage("L'email est requis")
    .isEmail().withMessage("Email invalide"),
  body("password")
    .notEmpty().withMessage("Le mot de passe est requis")
    .isLength({ min: 12 }).withMessage("Le mot de passe doit faire au moins 12 caractères")
    .custom((value) => {
      const Maj = /[A-Z]/.test(value);
      const Min = /[a-z]/.test(value);
      const Numero = /[0-9]/.test(value);
      const Special = /[^A-Za-z0-9]/.test(value);
      const types = [Maj, Min, Numero, Special].filter(Boolean).length;
      if (types < 3) {
        throw new Error("Le mot de passe doit contenir au moins 3 types de caractères (majuscule, minuscule, chiffre, spécial)");
      }
      return true;
    }),
  body("consent")
    .equals("true").withMessage("Le consentement est requis")
];

exports.validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("L'email est requis")
    .isEmail().withMessage("Email invalide"),
  body("password")
    .notEmpty().withMessage("Le mot de passe est requis")
];

exports.validateUpdateProfile = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage("Le nom d'utilisateur doit contenir entre 3 et 50 caractères"),
  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("Email invalide"),
  body("password")
    .optional()
    .isLength({ min: 12 }).withMessage("Le mot de passe doit faire au moins 12 caractères")
    .custom((value) => {
      if (!value) return true;
      const Maj = /[A-Z]/.test(value);
      const Min = /[a-z]/.test(value);
      const Numero = /[0-9]/.test(value);
      const Special = /[^A-Za-z0-9]/.test(value);
      const types = [Maj, Min, Numero, Special].filter(Boolean).length;
      if (types < 3) {
        throw new Error("Le mot de passe doit contenir au moins 3 types de caractères (majuscule, minuscule, chiffre, spécial)");
      }
      return true;
    })
];

// Recipes
exports.validateCreateRecipe = [
  body("title")
    .trim()
    .notEmpty().withMessage("Le titre est requis")
    .isLength({ min: 3, max: 255 }).withMessage("Le titre doit contenir entre 3 et 255 caractères"),
  body("description")
    .optional()
    .isLength({ max: 2000 }).withMessage("La description est trop longue"),
  body("image")
    .optional()
    .isURL().withMessage("L'URL de l'image doit être valide"),
  body("ingredients")
    .trim()
    .notEmpty().withMessage("Les ingrédients sont requis"),
  body("steps")
    .trim()
    .notEmpty().withMessage("Les étapes sont requises")
];

exports.validateUpdateRecipe = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 }).withMessage("Le titre doit contenir entre 3 et 255 caractères"),
  body("description")
    .optional()
    .isLength({ max: 2000 }).withMessage("La description est trop longue"),
  body("ingredients")
    .optional()
    .trim(),
  body("steps")
    .optional()
    .trim()
];


