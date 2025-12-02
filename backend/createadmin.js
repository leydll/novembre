const bcrypt = require("bcryptjs");

// Script utilitaire : génère simplement le hash d'un mot de passe fourni en paramètre.
// Usage :
//   node createadmin.js MonSuperMot2Passe!
//
// Ensuite, utilisez le hash dans une requête SQL manuelle :
//   INSERT INTO users (username, email, password, role)
//   VALUES ('admin', 'admin@bakesomecaakes.test', '<HASH_ICI>', 'admin');

async function generateHash() {
  const plain = process.argv[2];

  if (!plain) {
    console.log("Usage : node createadmin.js <mot_de_passe_en_clair>");
    process.exit(1);
  }

  try {
    const hashed = await bcrypt.hash(plain, 10);
    console.log("Mot de passe en clair :", plain);
    console.log("Hash bcrypt à utiliser dans la base :");
    console.log(hashed);
  } catch (err) {
    console.error("Erreur lors du hachage :", err);
  } finally {
    process.exit(0);
  }
}

generateHash();
