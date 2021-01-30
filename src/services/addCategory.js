const { Category } = require('../db/models');

const addCategory = (req, res) => {
    console.log('[INFO]', new Date(), 'Add category');

    console.log(req)

    const { categoryTitle, isPrivate = true, parentCategory } = req.body;

    if (!categoryTitle) {
        res.status(500).send({
            status: 'error',
            message: 'Title is empty',
            responseTime: new Date(),
        });
    } else {

        Category.create({
            categoryTitle,
            categoryDescription: '',
            isPrivate,
            parentCategory,
            createdBy: req.session.user.id,
        }, (_err, data) => {
            // TODO: error handler
            console.log('[INFO]', new Date(), 'Category created');

            res.send(data);
        });
    }
};

module.exports = addCategory;
