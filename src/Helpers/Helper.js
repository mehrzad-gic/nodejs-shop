import crypto from 'crypto';
import pool from '../Configs/Mysql2';


async function makeHashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}


async function verifyHashPassword(hash, password) {
    return hash === await makeHashPassword(password);
}



// Function to check if a record exists by a specific field
async function checkExistByField(field, value, table) {
    const [rows] = await pool.query(`SELECT * FROM ?? WHERE ?? = ?`, [table, field, value]);
    return rows.length > 0 ? rows[0] : false;
}

// Function to create a unique slug
async function makeSlug(name, table) {

    let slug = name.trim().replace(/\s+/g, '-').toLowerCase();
    
    let randomChar = crypto.randomBytes(3).toString('hex').toUpperCase();

    while (await checkExistByField('slug', slug, table)) {
        slug += `_${randomChar}`;
    }

    return slug;
}


export{
    verifyHashPassword,
    makeHashPassword,
    makeSlug,
    checkExistByField
}