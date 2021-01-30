const crypto = require('crypto');

const { fileEncryptionSecret, fileEncryptionVector } = require('../config');

const algorithm = 'aes-256-ctr';

const encryptString = (text) => {

    const cipher = crypto.createCipheriv(algorithm, fileEncryptionSecret, fileEncryptionVector);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return encrypted.toString('hex');
};

const decryptString = (hash) => {

    const decipher = crypto.createDecipheriv(algorithm, fileEncryptionSecret, fileEncryptionVector);

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

module.exports = {
    encryptString,
    decryptString
};
