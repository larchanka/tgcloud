const { Asset } = require('../db/models');

const getFileInformation = (req, res) => {
    console.log('[INFO]', new Date(), 'Get files');

    Asset.findById(req.params.id, (err, data) => {
        if (err) {
            console.log('[ERROR]', new Date(), 'DB error while file search. Id ' + req.params.id);

            return res.status(404).send({
                status: 'error',
                message: 'File not found / 2. Id: ' + req.params.id,
                errorStack: err,
                responseTime: new Date(),
            });
        }

        if (!data) {
            console.log('[ERROR]', new Date(), 'File with id ' + req.params.id + ' not found');

            return res.status(404).send({
                status: 'error',
                message: 'File not found. Id: ' + req.params.id,
                errorStack: err,
                responseTime: new Date(),
            });
        }

        console.log('[INFO]', new Date(), 'File with id ' + req.params.id + ' found');

        return res.send(data);
    });
};

module.exports = getFileInformation;
