const mongoose = require('mongoose');
const { Schema } = mongoose;

// User
const userSchema = new Schema({
    userId: Number,
    roleId: { type: Schema.Types.ObjectId, ref: 'userrole' },
});

const User = mongoose.model('user', userSchema);

// User Role
const userRoleSchema = new Schema({
    roleTitle: String,
});

const UserRole = mongoose.model('userrole', userRoleSchema);

// Access
const accessSchema = new Schema({
    type: String, // category | asset
    userId: Number,
    roleId: String,
    permissions: {
        write: Boolean,
        read: Boolean,
        delete: Boolean,
    },
});

const Access = mongoose.model('access', accessSchema);

// Asset Category
const categorySchema = new Schema({
    categoryTitle: String,
    categoryDescription: String,
    isPrivate: Boolean,
    parentCategory: { type: Schema.Types.ObjectId, ref: 'category' },
    createdBy: Number,
});

const Category = mongoose.model('category', categorySchema);

// Asset
const assetSchema = new Schema({
    tags: Array,
    categories: [{ type: Schema.Types.ObjectId, ref: 'category' }],
    createdBy: Number,
    createdAt: Date,
    updatedAt: Date,
    isPrivate: Boolean,
    isEncrypted: Boolean,
    originalName: String,
    originalSize: Number,
    vc: [
        {
            assetHash: String,
            assetName: String,
            assetSize: Number,
            telegramAssetId: String,
            localAssetPath: String,
            createdBy: Number,
            createdAt: Date,
        },
    ],
});

const Asset = mongoose.model('assets', assetSchema);

// Asset One Time Links
const otlSchema = new Schema({
    fileId: String,
    assetHash: String,
    createdBy: Number,
    createdAt: String,
});

const OneTimeLink = mongoose.model('onetimelink', otlSchema);

// Asset Comments
const commentsSchema = new Schema({
    parentId: { type: Schema.Types.ObjectId, ref: 'comment' },
    fileId: String,
    assetHash: String,
    createdBy: Number,
    createdAt: String,
    message: String,
});

const Comment = mongoose.model('comment', commentsSchema);

module.exports = {
    User,
    UserRole,
    Category,
    Asset,
    Access,
    OneTimeLink,
    Comment,
};
