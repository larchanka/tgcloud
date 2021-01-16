const sha256 = require('js-sha256').sha256;

const { User } = require('../db/models');

module.exports = async (req, res, next) => {
    const data = req.session.user;

    if (!data) {
        console.log('[WARNING]', new Date(), 'User is not authorized');
        return res.status(403).send({
            status: 'error',
            message: 'unauthorized',
        });
    }

    if (new Date().getTime() - data.auth_date * 1000 > 86400000) {
        console.log('[WARNING]', new Date(), 'User session expired');
        return res.status(403).send({
            status: 'error',
            message: 'unauthorized',
        });
    }

    const secretKey = sha256.create();
    secretKey.update(process.env.TELEGRAM_TOKEN);

    const dataObject = [];

    Object.keys(data).sort().forEach((key) => {
        if (key !== 'hash') {
            dataObject.push(`${key}=${data[key]}`);
        }
    });

    const hash = sha256.hmac(secretKey.digest(), dataObject.join('\n'));

    if (hash !== data.hash) {
        console.log('[WARNING]', new Date(), 'User Hash is incorrect');

        return res.status(403).send({
            status: 'error',
            message: 'unauthorized',
        });
    }

    console.log('[INFO]', new Date(), `User ${data.id} is authorized`);

    console.log('[INFO]', new Date(), `Checking user ${data.id} access persmissions`);

    const registeredUser = await User.findOne({
        userId: data.id,
    });

    if (!registeredUser) {
        console.log('[WARNING]', new Date(), 'User is not registered');

        return res.status(403).send({
            status: 'error',
            message: 'unauthorized',
        });
    }

    next();
};
