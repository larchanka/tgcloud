const mongoose = require('mongoose');

console.log('[INFO]', new Date(), 'Connecting to MongoDB');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('[INFO]', new Date(), 'MongoDB connected');
});

module.exports = db;
