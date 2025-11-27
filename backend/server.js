require('dotenv').config();
const express = require('express');
const pool = require('./config/database'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ result: rows[0].solution });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

pool.getConnection()
  .then(() => console.log("Connecté à la base de données"))
  .catch(err => console.error("Erreur de connexion à la base de données :", err));

app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
