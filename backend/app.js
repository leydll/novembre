require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
let rateLimit;
try {
  // Utilise express-rate-limit si installé, sinon fallback no-op (utile en test)
  rateLimit = require("express-rate-limit");
} catch (_e) {
  rateLimit = () => (req, res, next) => next();
}
const pool = require("./config/database");
const authRoutes = require("./routes/auth");
const recipesRoutes = require("./routes/recipes");

const app = express();

// Sécurité HTTP de base (headers)
app.use(helmet());

// Limitation de débit (rate limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS (adapter origin en production)
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Cookies (pour JWT HttpOnly, Secure, SameSite)
app.use(cookieParser());

// Limiter la taille des payloads JSON / urlencoded
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Redirection HTTP -> HTTPS en production (si derrière un proxy)
if (process.env.NODE_ENV === "production") {
  app.enable("trust proxy");
  app.use((req, res, next) => {
    if (req.secure) return next();
    return res.redirect(`https://${req.headers.host}${req.url}`);
  });
}

// Log simple des requêtes en dev
if (process.env.NODE_ENV !== "test") {
  app.use((req, res, next) => {
    console.log(req.method, req.url, req.body);
    next();
  });
}

// routes
app.use("/auth", authRoutes);
app.use("/recipes", recipesRoutes);

// test de connexion à la base (uniquement hors test)
if (process.env.NODE_ENV !== "test") {
  pool
    .getConnection()
    .then(() => console.log("connecté à la base de données"))
    .catch((err) => console.error("erreur de connexion :", err));
}

module.exports = app;


