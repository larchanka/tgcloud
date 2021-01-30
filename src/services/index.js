const fileUpload = require('express-fileupload');

const getFile = require('./getFile');
const getFileOneTimeLink = require('./getFileOneTimeLink');
const getFileInformation = require('./getFileInformation');
const listFiles = require('./listFiles');
const uploadFile = require('./uploadFile');
const deleteFile = require('./deleteFile');
const setFilePrivacy = require('./setFilePrivacy');
const setFileCategory = require('./setFileCategory');
const listCategories = require('./listCategories');

function initApi(router) {
    console.log('[INFO]', new Date(), 'Initiate API');

    router.post('/upload', fileUpload(), uploadFile);
    router.get(['/files/filter/:filter/category/:categoryId', '/files/filter/:filter'], listFiles);
    router.get('/categories(/filter/:filter)?', listCategories);
    router.get('/files/:id', getFileInformation);
    router.get('/files/:id/privacy/:privacy', setFilePrivacy);
    router.get('/files/:id/category/:categoryId', setFileCategory);
    router.get('/file/:id/:checksum', getFile);
    router.get('/file/:id/:checksum/otl', getFileOneTimeLink);
    router.delete('/file/:id/:checksum', deleteFile);

    return router;
};

module.exports = initApi;
