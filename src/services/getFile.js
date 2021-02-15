const fs = require('fs');
const got = require('got');
const { createDecipheriv } = require('crypto');

const config = require('../config');
const { Asset } = require('../db/models');
const TelegramBot = require('../telegram');

const getFile = (req, res) => {
    const fileChecksum = req.params.checksum;
    const fileId = req.params.id;
    const findOptions = {
        $or: [
            { createdBy: req.session.user.id },
            { isPrivate: false },
        ]
    };

    console.log('[INFO]', new Date(), 'Get file with checksum:', fileChecksum);

    const filePath = config.fileTmpStorage + fileChecksum;

    return Asset.findById(fileId, undefined, findOptions, (err, data) => {
        if (err || !data) {
            console.log('[ERROR]', new Date(), 'File not found. Id:', fileId);

            return res.status(404).send({
                status: 'error',
                message: 'File not found',
                responseTime: new Date(),
            });
        }

        const asset = data.vc.find(a => a.assetHash === fileChecksum);

        if (!asset) {
            console.log('[ERROR]', new Date(), 'File by hash not found. Checksum:', fileChecksum, 'Id:', fileId);

            return res.status(404).send({
                status: 'error',
                message: 'File not found / 2',
                responseTime: new Date(),
            });
        }

        if (fs.existsSync(filePath)) {
            return fs.createReadStream(filePath)
                .pipe(createDecipheriv('aes-256-cbc', config.fileEncryptionSecret, config.fileEncryptionVector))
                .pipe(res);
        }

        const tgId = asset.telegramAssetId;
        const bot = TelegramBot();

        bot.getFile(tgId).then(resp => {
            const { file_path } = resp;
            const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN}/${file_path}`;

            got.stream(url)
                .pipe(createDecipheriv('aes-256-cbc', config.fileEncryptionSecret, config.fileEncryptionVector))
                .pipe(res);
        });

    });
};

module.exports = getFile;
