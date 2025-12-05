const jwt = require("jsonwebtoken");

/**
 * Middleware d'authentification JWT
 *
 * Le but est de vérifier que l'utilisateur est authentifié avant d'accéder aux routes protégées.
 * 1. Cookie HttpOnly (recommandé pour la sécurité, protège contre XSS)
 * 2. Header Authorization Bearer (utile pour les appels API depuis le frontend)
 * La double source de token permet de supporter à la fois : les requêtes navigateur (cookies) et les appels programmatiques (headers). Le cookie est prioritaire car plus sécurisé (HttpOnly empêche l'accès JavaScript).
 */
module.exports = (req, res, next) => {
  const cookieToken = req.cookies?.auth;
  const headerToken = req.headers.authorization?.split(" ")[1];
  const token = cookieToken || headerToken;

  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (_err) {
    res.status(401).json({ message: "Token invalide" });
  }
};
