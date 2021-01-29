const fileUpload = require('express-fileupload');

const getFile = require('./getFile');
const getFileInformation = require('./getFileInformation');
const listFiles = require('./listFiles');
const uploadFile = require('./uploadFile');
const deleteFile = require('./deleteFile');
const setFilePrivacy = require('./setFilePrivacy');

function initApi(router) {
    console.log('[INFO]', new Date(), 'Initiate API');

    router.post('/upload', fileUpload(), uploadFile);
    router.get('/files(/filter/:filter)?', listFiles);
    router.get('/files/:id', getFileInformation);
    router.get('/files/:id/privacy/:privacy', setFilePrivacy);
    router.get('/file/:id/:checksum', getFile);
    router.delete('/file/:id/:checksum', deleteFile);

    return router;
};

module.exports = initApi;
