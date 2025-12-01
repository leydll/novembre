const bcrypt = require('bcryptjs');

async function generateAdminPassword() {
    const password = 'adminLeila123';
    const hashed = await bcrypt.hash(password, 10);
    console.log('Mot de passe hashé :', hashed);
}

generateAdminPassword();
