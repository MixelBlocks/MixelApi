// Copyright © 2021 - 2022 | 𝕷𝖚𝖈𝖎𝖋𝖊𝖗#1234 | All Rights Reserved | ( Email: contact@lucifer-morningstar.xyz )

// append process.env object by some system variables ( ./.env )
require('dotenv').config();

const API_VERSION = 'v1';

// require node-fetch module for general requests
global.fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// imports
const fs = require('fs');

const Redis = require('redis');
const express = require('express');
const compression = require('compression');
const serveFavicon = require('serve-favicon');
const cookieParser = require('cookie-parser');

const defaultPath = __dirname.endsWith('/') ? __dirname : __dirname + '/';
const apiRoutePath = defaultPath + '/api/' + API_VERSION;

const devPort = process.env.DEV_PORT;
const port = process.env.PORT;

const debugMode = process.env.DEBUG_MODE;
const debugLevel = process.env.DEBUG_LEVEL;

const app = express();
app.API_VERSION = API_VERSION;

app.debug = (message, ...optional) => {
    if (debugMode && debugLevel >= 9) console.log(message, ...optional);
};

app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('json spaces', 4);
app.set('view engine', 'ejs');

app.use(serveFavicon(defaultPath + 'public/favicon.ico'));

// CREATE REDIS CLIENT INSTANCE
var redisClient = Redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

redisClient.on('error', (redisClientError) => console.error('[REDIS CLIENT] ERROR: ', redisClientError));

redisClient
    .connect()
    .then(() => {
        app.debug('[REDIS CLIENT] connected... performing authentication');
        redisClient
            .auth({
                username: process.env.REDIS_USER,
                password: process.env.REDIS_AUTH,
            })
            .then(async () => {
                await redisClient.set('api.start.auth.message', '[REDIS CLIENT] Authentication performed successful. READY TO USE', { ex: 1000 });
                var response = await redisClient.get('api.start.auth.message');
                app.debug(response);
            })
            .catch(console.error);
    })
    .catch(console.error);

app.redis = redisClient;

// require MongoDB Handler
var MongoDBHandler = require('./tools/databaseHandler');
app.db = new MongoDBHandler(process.env.MONGO_CONNECTION);

// load and apply RequestManager to express instance
const RequestManager = require('./tools/requests');
RequestManager.setApp(app);

// load JWT handler
const TokenManager = require('./tools/jwt');
app.jwt = new TokenManager();

// for security reason remove the powered by header
app.use(function (req, res, next) {
    res.removeHeader('X-Powered-By');
    next();
});

// CORS Policy things
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// remove all /api/... /api routes
app.route(/(\/api\/?\/?\*?)/g).all((req, res) => {
    return res.redirect(req.path.replace(/\/api/g, ''));
});

// static documentation webserver
app.use('/docs', express.static('docs'));
app.use('/public', express.static('public'));

// basic redirects
app.get('/discord', (req, res) => res.redirect('https://discord.gg/mSQefzR3XH'));
app.get('/support', (req, res) => res.redirect('https://discord.gg/mSQefzR3XH'));

app.get('/github', (req, res) => res.redirect('https://github.com/MixelBlocks'));

app.get('/web', (req, res) => res.redirect('https://mixelblocks.de'));
app.get('/website', (req, res) => res.redirect('https://mixelblocks.de'));

app.get('/dashboard', (req, res) => res.redirect('https://dash.mixelblocks.de'));

app.get([/\/(ver|version)/, '/v'], (req, res, next) => {
    return res.status(200).json({
        error: false,
        api: API_VERSION,
        baseURL: 'https://api.mixelblocks.de/' + API_VERSION + '/',
        server: require('./package.json').version,
    });
});

app.profiles = {};
app.users = {};

// verify user access
app.use(async (req, res, next) => {
    var token = req.headers.authorization || req.body.authorization;
    if (!token) return next();

    var data;
    try {
        data = app.jwt.verifyToken(token);
    } catch (error) {
        return next();
    }

    var revokedToken = await app.db.queryAsync('api', 'revoked_tokens', { token: token });
    if (revokedToken[0] != null) return next();

    var user = app.users[data.uuid];
    var profile = app.profiles[data.uuid];

    if (!user) {
        var userData = await app.db.queryAsync('api', 'users', { uuid: data.uuid }).catch((error) => {});
        if (!userData[0]) return next();
        app.users[data.uuid] = userData[0];
    }

    if (!profile) {
        var profileData = await app.db.queryAsync('api', 'profiles', { user: data.uuid }).catch((error) => {});
        if (!profileData || !profileData[0]) {
            app.profiles[data.uuid] = {
                user: data.uuid,
                avatar: '',
                status: '',
                status_emoji: '😎',
                bio: '',
                createdAt: new Date(),
            };
            await app.db.insertObjectAsync('api', 'profiles', app.profiles[data.uuid]).catch((error) => {});
        } else app.profiles[data.uuid] = profileData[0];
    }

    req.user = app.users[data.uuid];
    req.user.profile = app.profiles[data.uuid];
    next();
});

// enable api routes
fs.readdirSync(`./api/${API_VERSION}/`).forEach((file) => {
    if (!file.endsWith('.js')) return;
    if (file.startsWith('_')) return;
    let props = require(`./api/${API_VERSION}/${file}`);
    let routerPath = `/${API_VERSION}/${props.path}`;
    app.use(routerPath, props.router(app, routerPath));
    app.debug('[REGISTERED ROUTE] Path: ' + routerPath);
});

// ERROR 404 Handling
app.get('*', (req, res, next) => {
    return res.status(404).json({
        error: true,
        code: 'notFound',
        message: 'That API Endpoint does not exist.',
    });
});

// finally create server and listen for the defined port
if (process.env.DEVELOPMENT_MODE) {
    app.listen(devPort, () => {
        console.log('[ DEVELOPMENT ] » JSON API Server is now running on Port: ' + devPort);
    });
} else {
    app.listen(port, () => {
        console.log('[ PRODUCTION ] » JSON API Server is now running on Port: ' + port);
        // send DISCORD WEBHOOK when process STARTS
        // RequestManager.sendWebHook(process.env.DISCORD_API_HOOK, { username: 'API HOOK', content: '✅ API Process restarted...' }).catch(console.error);
    });
}

// STATIC WEBSITE
const webApp = express();
webApp.use(compression());
webApp.use(cookieParser());
webApp.use(express.json());
webApp.use(express.urlencoded({ extended: false }));
// for security reason remove the powered by header
webApp.use(function (req, res, next) {
    res.removeHeader('X-Powered-By');
    next();
});
// CORS Policy things
webApp.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
webApp.get('/discord', (req, res) => res.redirect('https://discord.gg/mSQefzR3XH'));
webApp.get('/support', (req, res) => res.redirect('https://discord.gg/mSQefzR3XH'));
webApp.get('/github', (req, res) => res.redirect('https://github.com/MixelBlocks'));
webApp.get('/dashboard', (req, res) => res.redirect('https://dash.mixelblocks.de'));
webApp.use(express.static('public'));
webApp.listen(8000);
