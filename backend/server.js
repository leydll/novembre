require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database'); 
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// middlewares
app.use(cors({
  origin: "http://localhost:5173", // frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true 
}));

app.use(express.json());

app.use((req, res, next) => {
    console.log(req.method, req.url, req.body);
    next();
});

// routes
app.use('/auth', authRoutes);

// test de connexion à la base
pool.getConnection()
  .then(() => console.log("connecté à la base de données"))
  .catch(err => console.error("erreur de connexion :", err));

// démarrage serveur
app.listen(PORT, () => console.log(`serveur démarré sur le port ${PORT}`));
