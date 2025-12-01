require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pool = require('./config/database'); 
const authRoutes = require('./routes/auth');
const recipesRoutes = require("./routes/recipes");

const app = express();
const PORT = process.env.PORT || 5001;

// Sécurité HTTP de base
app.use(helmet());

// Limitation de débit (rate limiting)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP / fenêtre
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// CORS (adapter origin en production)
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true 
}));

// Limiter la taille des payloads JSON / urlencoded
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use((req, res, next) => {
    console.log(req.method, req.url, req.body);
    next();
});

// routes
app.use('/auth', authRoutes);
app.use("/recipes", recipesRoutes);

// test de connexion à la base
pool.getConnection()
  .then(() => console.log("connecté à la base de données"))
  .catch(err => console.error("erreur de connexion :", err));

// démarrage serveur
app.listen(PORT, () => console.log(`serveur démarré sur le port ${PORT}`));
