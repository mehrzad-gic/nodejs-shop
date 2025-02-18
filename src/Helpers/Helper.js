import crypto from 'crypto';

async function makeHashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function verifyHashPassword(hash, password) {
    return hash === await makeHashPassword(password);
}


export{
    verifyHashPassword,
    makeHashPassword,
}