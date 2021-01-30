const signin = (req, res) => {
    const user = req.body;

    console.log('[INFO]', new Date(), 'Sign in request:', user.id);

    if (!Object.keys(user).length) {
        console.log('[ERROR]', new Date(), 'User is empty');

        return res.status(401).send({
            status: 'error',
            message: 'unauthorized',
        });
    }

    req.session.user = user;

    console.log('[INFO]', new Date(), 'User is logged in:', user.id);

    res.send({
        status: 'ok',
        message: 'user data is stored',
    });
};

module.exports = signin;
