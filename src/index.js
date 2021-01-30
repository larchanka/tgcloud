require('dotenv').config({});
require('./db');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const MemoryStore = require('memorystore')(session);

console.log('[INFO]', new Date(), 'Starting application');

const api = require('./services');
const signin = require('./services/signin');
const getOtlFile = require('./services/getOtlFile');
const downloadFileOneTimeLink = require('./services/downloadFileOneTimeLink');
const authentication = require('./middleware/authentication');

const app = express();
app.use(cors());
app.set('trust proxy', 1);
app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
}));
app.use((_req, _res, next) => {
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', function (req, res) {
    console.log('[INFO]', new Date(), 'Health Check route is called');

    const response = {
        status: 'ok',
        message: 'Hello World',
        responseTime: new Date(),
        activeSession: req.session.user && !!Object.keys(req.session.user).length,
    };
    console.log('[INFO]', new Date(), 'Health check response:', JSON.stringify(response));

    res.send(response);
});

app.get('/session', authentication, function (req, res) {
    console.log('[INFO]', new Date(), 'Health Check route is called');

    const response = {
        status: 'ok',
        message: req.session.user,
        responseTime: new Date(),
    };
    console.log('[INFO]', new Date(), 'Health check response:', JSON.stringify(response));

    res.send(response);
});

const router = express.Router();

app.post('/signin', signin);

app.get('/otl/:otlChecksum/download', downloadFileOneTimeLink);
app.get('/otl/:otlChecksum', getOtlFile);

app.use('/api/v1', authentication, api(router));

app.use('/', express.static(process.env.NODE_ENV === 'production' ? 'build/public' : 'public'));

app.use((_req, res) => {
    res.sendFile(path.resolve(__dirname, process.env.NODE_ENV === 'production' ? '../build/public/index.html' : '../public/index.html'));
});

app.listen(process.env.PORT, () => {
    console.log('[INFO]', new Date(), `Example app listening at http://localhost:${process.env.PORT}`)
});
