const got = require('got');
const { createDecipheriv } = require('crypto');
const { decryptString } = require('../utils/encryptDecryptString');

const config = require('../config');
const { Asset, OneTimeLink } = require('../db/models');
const TelegramBot = require('../telegram');

const getOtlFile = async (req, res) => {
    const otlChecksum = req.params.otlChecksum;
    let decryptedOtl;

    console.log('[INFO]', new Date(), 'One time link file download - direct:', otlChecksum);

    try {
        decryptedOtl = otlChecksum;
    } catch(e) {
        console.log('[WARNING]', new Date(), 'One time link file download - unauthorized token:', otlChecksum);
    }

    if (!decryptedOtl) {
        return res.status(403).send({
            status: 'error',
            message: 'unauthorized',
        });
    }

    const otl = await OneTimeLink.findById(decryptedOtl);
    
    if (!otl) {
        console.log('[INFO]', new Date(), 'One time link file download not found:', otlChecksum);
        return res.status(404).send({
            status: 'error',
            message: 'File not found',
            responseTime: new Date(),
        });
    }

    const asset = await Asset.findById(otl.fileId);

    if (!asset) {
        console.log('[INFO]', new Date(), 'One time link points to wrong file:', otl.fileId);
        return res.status(404).send({
            status: 'error',
            message: 'File not found',
            responseTime: new Date(),
        });
    }

    const assetVersion = asset.vc.find(a => a.assetHash === otl.assetHash);

    if (!assetVersion) {
        console.log('[INFO]', new Date(), 'One time link points to wrong file version:', otl.fileId, assetVersion);
        return res.status(404).send({
            status: 'error',
            message: 'File not found',
            responseTime: new Date(),
        });
    }

    const tgId = assetVersion.telegramAssetId;
    const bot = TelegramBot();

    bot.getFile(tgId).then(async resp => {
        const { file_path } = resp;
        const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${file_path}`;

        console.log('[INFO]', new Date(), 'File was downloaded');

        await OneTimeLink.findByIdAndDelete(decryptedOtl._id);

        console.log('[INFO]', new Date(), 'File OTL was deleted');

        got.stream(url)
            .pipe(createDecipheriv('aes-256-cbc', config.fileEncryptionSecret, config.fileEncryptionVector))
            .pipe(res);
    });
};

module.exports = getOtlFile;
