const { Asset, OneTimeLink } = require('../db/models');
const TelegramBot = require('../telegram');
const { encryptString } = require('../utils/encryptDecryptString');

const getFileOneTimeLink = async (req, res) => {
    const fileChecksum = req.params.checksum;
    const fileId = req.params.id;

    console.log('[INFO]', new Date(), 'Get file with checksum:', fileChecksum);

    return Asset.findById(fileId, async (err, data) => {
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

        const dataObj = {
            fileId,
            assetHash: fileChecksum,
            createdBy: req.session.user.id,
            createdAt: String(new Date().getTime()),
        };

        const dataInfo = await OneTimeLink.create(dataObj);

        const otlHash = encryptString(JSON.stringify(dataInfo));

        const bot = TelegramBot();

        bot.sendMessage(req.session.user.id, `OneTimeLink for **${asset.assetName}**: ${otlHash}`);

        const response = {
            status: 'ok',
            message: otlHash,
            responseTime: new Date(),
        };

        res.send(response);

    });
};

module.exports = getFileOneTimeLink;
