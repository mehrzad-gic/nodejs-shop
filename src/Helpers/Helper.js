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


async function makeHashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function verifyHashPassword(hash, password) {
    return hash === await makeHashPassword(password);
}

function makeOTP() {
    // Generate 6-character code
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Set expiration time to 2 minutes from now
    const expire = new Date().getTime() + 2 * 60 * 1000; // 2 minutes in milliseconds

    return {code,expire}
}


export {
    verifyHashPassword,
    makeHashPassword,
    makeSlug,
    checkExistByField,
    makeOTP,
}