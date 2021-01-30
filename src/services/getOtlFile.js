const { decryptString } = require('../utils/encryptDecryptString');
const { Asset, OneTimeLink } = require('../db/models');
const otlTemplate = require('../templates/otl');

const getOtlFile = async (req, res) => {
    const otlChecksum = req.params.otlChecksum;
    let decryptedOtl;

    console.log('[INFO]', new Date(), 'One time link file download:', otlChecksum);

    try {
        decryptedOtl = JSON.parse(decryptString(otlChecksum));
    } catch(e) {
        console.log('[WARNING]', new Date(), 'One time link file download - unauthorized token:', otlChecksum);
    }

    if (!decryptedOtl) {
        return res.status(403).send({
            status: 'error',
            message: 'unauthorized',
        });
    }

    console.log(decryptedOtl._id)

    const otl = await OneTimeLink.findById(decryptedOtl._id);
    
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

    res.send(otlTemplate(otlChecksum, assetVersion));
};

module.exports = getOtlFile;
