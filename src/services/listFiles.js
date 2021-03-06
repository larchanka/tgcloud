const { Asset } = require('../db/models');

const listFiles = (req, res) => {
    console.log('[INFO]', new Date(), 'Get files');

    const { filter, categoryId } = req.params;
    const findOptions = {
        $or: [
            { createdBy: req.session.user.id },
            { isPrivate: false },
        ]
    };

    findOptions.categories = categoryId ? { $in : categoryId } : [];
    let filterOptions = { sort: { updatedAt: -1 } };
    
    if (filter) {
        console.log('[INFO]', new Date(), 'Filter set:', filter);
        filterOptions = JSON.parse(filter.replace(/~/g, '"'));
    }

    Asset.find(findOptions, null, filterOptions).populate('categories').exec((err, data) => {
        if (err) {
            console.log('[INFO]', new Date(), 'Files not found', findOptions);
            return res.status(404).send({
                status: 'error',
                message: 'Files not found',
                responseTime: new Date(),
            })
        }
        // TODO: error handler
        console.log('[INFO]', new Date(), 'Total files found:', data.length);

        return res.send(data);
    });
};

module.exports = listFiles;
