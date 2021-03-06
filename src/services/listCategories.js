const { Category } = require('../db/models');

const listCategories = (req, res) => {
    console.log('[INFO]', new Date(), 'Get categories');

    const { filter } = req.params;
    const findOptions = {
        $or: [
            { createdBy: req.session.user.id },
            { isPrivate: false },
        ]
    };
    let filterOptions = { sort: { categoryTitle: 1 } };

    if (filter) {
        console.log('[INFO]', new Date(), 'Filter set:', filter);
        filterOptions = JSON.parse(filter.replace(/~/g, '"'));
    }

    Category.find(findOptions, null, filterOptions, (_err, data) => {
        // TODO: error handler
        console.log('[INFO]', new Date(), 'Total categories found:', data.length);

        res.send(data);
    });
};

module.exports = listCategories;
