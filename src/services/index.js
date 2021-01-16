const fileUpload = require('express-fileupload');

const getFile = require('./getFile');
const getFileInformation = require('./getFileInformation');
const listFiles = require('./listFiles');
const uploadFile = require('./uploadFile');

function initApi(router) {
    console.log('[INFO]', new Date(), 'Initiate API');

    router.post('/upload', fileUpload(), uploadFile);
    router.get('/files(/filter/:filter)?', listFiles);
    router.get('/files/:id', getFileInformation);
    router.get('/file/:id/:checksum', getFile);

    return router;
};

module.exports = initApi;
