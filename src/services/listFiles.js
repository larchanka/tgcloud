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

    Asset.find(findOptions, null, filterOptions, (_err, data) => {
        // TODO: error handler
        console.log('[INFO]', new Date(), 'Total files found:', data.length);

        res.send(data);
    });
};

module.exports = listFiles;
