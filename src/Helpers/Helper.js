import dotenv from "dotenv";
dotenv.config();
import logger from "./Logger.js";
import crypto from 'crypto';
import { query } from "../Configs/PostgresQl.js";

async function makeHashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}


async function verifyHashPassword(hash, password) {
    return hash === await makeHashPassword(password);
}



// Function to check if a record exists by a specific field
async function checkExistByField(field, value, table) {
    const result = await query(`SELECT id FROM ${table} WHERE ${field}=$1`,[value]);
    return result
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



function makeOTP() {
    // Generate 6-character code
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    // Set expiration time to 2 minutes from now
    const expire = new Date().getTime() + 2 * 60 * 1000; // 2 minutes in milliseconds
    return {code,expire}
}


// Function to generate a random password
function generateRandomPassword(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}


function logError(err){

    const env = process.env.NODE_ENV

    if(env == "development"){

        logger.error(err)
    }

}


export {
    logError,
    makeHashPassword,
    makeOTP,
    makeSlug,
    verifyHashPassword,
    generateRandomPassword
}