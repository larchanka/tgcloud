const signout = (req, res) => {
    delete req.session.user;

    console.log('[INFO]', new Date(), 'User is logged out');

    res.send({
        status: 'ok',
        message: 'user is logged out',
    });
};

module.exports = signout;
