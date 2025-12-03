const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // On accepte soit un JWT dans un cookie HttpOnly, soit dans le header Authorization (Bearer)
  const cookieToken = req.cookies?.auth;
  const headerToken = req.headers.authorization?.split(" ")[1];
  const token = cookieToken || headerToken;

  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // id et role
    next();
  } catch (_err) {
    res.status(401).json({ message: "Token invalide" });
  }
};
