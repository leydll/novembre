const { body, param, query } = require("express-validator");

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
    .isLength({ min: 6 }).withMessage("Le mot de passe doit faire au moins 6 caractères")
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
    .isLength({ min: 6 }).withMessage("Le mot de passe doit faire au moins 6 caractères")
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


