const fs = require('fs');
const { pipeline } = require('stream');
const { createCipheriv } = require('crypto');
const { promisify } = require('util');

const TelegramBot = require('../telegram');
const { Asset } = require('../db/models');
const config = require('../config');
const generateChecksumFromFile = require('../utils/generategenerateChecksumFromFile');

const { createReadStream, createWriteStream } = fs;

const uploadFile = (req, res) => {
    console.log('[INFO]', new Date(), 'File upload request');

    if (!req.files || !Object.keys(req.files).length) {
        return res.status(400).send({
            status: 'error',
            message: 'No file received',
            responseTime: new Date(),
        });
    }

    const uploadedFile = req.files.selectedFile;
    const uploadPath = config.fileTmpStorage + uploadedFile.name;

    // Use the mv() method to place the file somewhere on your server
    return uploadedFile.mv(uploadPath, function(err) {
        if (err) {
            console.log('[ERROR]', new Date(), 'File upload generic error');

            return res.status(500).send({
                status: 'error',
                message: 'File upload error',
                errorStack: err,
                responseTime: new Date(),
            });
        }

        const fileChecksum = generateChecksumFromFile(uploadedFile.data);
        const newFilePath = config.fileTmpStorage + fileChecksum;

        // fs.renameSync(uploadPath, newFilePath);

        promisify(pipeline)(
            createReadStream(uploadPath),
            createCipheriv('aes-256-cbc', config.fileEncryptionSecret, config.fileEncryptionVector),
            createWriteStream(newFilePath)
        )
            .then((_data) => {
                fs.unlinkSync(uploadPath);
                const telegramBot = TelegramBot();

                console.log('[INFO]', new Date(), 'File uploaded:', newFilePath);

                return telegramBot.sendDocument(req.session.user.id, newFilePath)
                    .then((data) => {
                        const telegramAssetId = data.document.file_id;
                        const creationDate = new Date();

                        return Asset.create({
                            tags: [],
                            categories: [],
                            createdBy: req.session.user.id,
                            createdAT: creationDate,
                            updatedAt: creationDate,
                            originalName: uploadedFile.name,
                            originalSize: uploadedFile.size,
                            isPrivate: true,
                            vc: [
                                {
                                    assetHash: fileChecksum,
                                    assetName: uploadedFile.name,
                                    assetSize: uploadedFile.size,
                                    telegramAssetId,
                                    localAssetPath: newFilePath,
                                    createdBy: req.session.user.id,
                                    createdAt: creationDate,
                                },
                            ],
                        }, () => {
                            console.log('[INFO]', new Date(), 'File registered', fileChecksum);
        
                            const response = {
                                status: 'ok',
                                message: 'File uploaded',
                                responseTime: new Date(),
                            };

                            if (!config.useLocalStorage) {
                                setTimeout(() => {
                                    fs.unlinkSync(newFilePath);
                                    console.log('[INFO]', new Date(), 'Local file deleted:', fileChecksum);
                                }, 100);
                            }
                        
                            return res.send(response);
                        });
                    })
                    .catch(err => {
                        console.log('[ERROR]', new Date(), 'File upload to telegram error');

                        return res.status(500).send({
                            status: 'error',
                            message: 'File upload error / 3',
                            errorStack: err,
                            responseTime: new Date(),
                        });
                    });
                

            })
            .catch(err => {
                console.log('[ERROR]', new Date(), 'File upload encryption error');

                return res.status(500).send({
                    status: 'error',
                    message: 'File upload error / 2',
                    errorStack: err,
                    responseTime: new Date(),
                });
            });
    });
};

module.exports = uploadFile;
