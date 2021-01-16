const fileger = require('fileger');
const fs = require('fs');
const got = require('got');
const { createDecipheriv } = require('crypto');

const config = require('../config');
const { Asset } = require('../db/models');
const TelegramBot = require('../telegram');

const deleteFile = (req, res) => {
    const fileId = req.params.id;
    const fileChecksum = req.params.checksum;

    console.log('[INFO]', new Date(), 'Delete file with checksum:', fileChecksum);

    return Asset.findById(fileId, (err, data) => {
        if (err || !data) {
            console.log('[ERROR]', new Date(), 'File not found. Id:', fileId);

            return res.status(404).send({
                status: 'error',
                message: 'File not found',
                responseTime: new Date(),
            });
        }

        data.vc.forEach(f => {
            if (fs.existsSync(f.localAssetPath)) {
                fs.inlinkSync(f.localAssetPath);
            }
        });

        Asset.deleteOne({_id: fileId}, (err, _resp) => {
            if (err || !data) {
                console.log('[ERROR]', new Date(), 'File cannot be deleted. Id:', fileId);
    
                return res.status(500).send({
                    status: 'error',
                    message: 'Cannot delete file',
                    responseTime: new Date(),
                });
            }

            return res.send({
                status: 'ok',
                message: 'File deleted',
                responseTime: new Date(),
            });
        });
    });
};

module.exports = deleteFile;
