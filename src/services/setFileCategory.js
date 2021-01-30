const fileger = require('fileger');
const fs = require('fs');
const got = require('got');
const { createDecipheriv } = require('crypto');

const config = require('../config');
const { Asset } = require('../db/models');
const TelegramBot = require('../telegram');

const setFileCategory = (req, res) => {
    const fileId = req.params.id;
    const categoryId = req.params.categoryId;

    console.log('[INFO]', new Date(), 'Setting file category with id:', fileId, categoryId);

    return Asset.findById(fileId, (err, data) => {
        if (err || !data) {
            console.log('[ERROR]', new Date(), 'File not found. Id:', fileId);

            return res.status(404).send({
                status: 'error',
                message: 'File not found',
                responseTime: new Date(),
            });
        }

        if (req.session.user.id !== data.createdBy) {
            return res.status(403).send({
                status: 'error',
                message: 'User is not authorized',
                responseTime: new Date(),
            });
        }

        Asset.updateOne({_id: fileId}, {
            categories: categoryId !== 'NaN' ? [categoryId] : [],
        }, (err, _resp) => {
            if (err || !data) {
                console.log('[ERROR]', new Date(), 'File category cannot be changed. Id:', fileId, categoryId);
    
                return res.status(500).send({
                    status: 'error',
                    message: 'Cannot change file category',
                    responseTime: new Date(),
                });
            }

            return res.send({
                status: 'ok',
                message: 'File category changed',
                responseTime: new Date(),
            });
        });
    });
};

module.exports = setFileCategory;
