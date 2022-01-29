// Copyright © 2021 - 2022 | 𝕷𝖚𝖈𝖎𝖋𝖊𝖗#1234 | All Rights Reserved | ( Email: contact@lucifer-morningstar.xyz )

const express = require('express');
var uuid = require('uuid');
const { passwordStrength: pws } = require('check-password-strength');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports.path = 'auth';

module.exports.router = (app, routerPath, router = express.Router()) => {
    var router = express.Router();

    router.all('/', async (req, res) => {
        return res.status(200).json({
            error: true,
        });
    });

    router.post('/registerUser', async (req, res) => {
        const { username, email, password, password_confirm } = req.body;

        if (!username || !email || !password || !password_confirm)
            return res.status(400).json({
                error: true,
                message: 'invalidRequest',
            });

        if (password !== password_confirm)
            return res.status(401).json({
                error: true,
                message: 'passwordMismatch',
            });

        var passwordStrength = pws(password);

        if (passwordStrength.length < 8 || !passwordStrength.contains.includes('number') || !passwordStrength.contains.includes('lowercase') || !passwordStrength.contains.includes('uppercase'))
            return res.status(406).json({
                error: true,
                message: 'passwordStrengthInvalid',
                contains: passwordStrength.contains,
                length: passwordStrength.length,
                description: 'must contain lowercase/uppercase/number and min 8 characters',
            });

        var userDataRes = await app.db.queryAsync('api', 'users', { username: username }).catch((error) => {
            console.error(error);
            return res.status(500).json({
                error: true,
                message: 'databaseError',
            });
        });

        if (userDataRes.length > 0)
            return res.status(409).json({
                error: true,
                message: 'userExists',
            });

        var mailDataRes = await app.db.queryAsync('api', 'users', { email: email }).catch((error) => {
            console.error(error);
            return res.status(500).json({
                error: true,
                message: 'databaseError',
            });
        });

        if (mailDataRes.length > 0)
            return res.status(409).json({
                error: true,
                message: 'mailExists',
            });

        var randomUUID = uuid.v4();
        var authCode = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100000 + Math.random() * 900000)}`;

        var passwordHashed = bcrypt.hashSync(password, saltRounds);

        var created = new Date();

        await app.db.insertObjectAsync('api', 'users', {
            uuid: randomUUID,
            username: username,
            active: true,
            groups: ['guest'],
            email: email,
            email_verified: false,
            password: passwordHashed,
            minecraft: {
                uuid: '',
                username: '',
                code: authCode,
            },
            createdAt: created,
        });

        await app.db.insertObjectAsync('api', 'profiles', {
            user: randomUUID,
            avatar: null,
            bio: '',
            createdAt: created,
        });

        return res.status(201).json({
            error: false,
            token: app.jwt.createToken({ exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, uuid: randomUUID, username: username, email: email }),
            authCode: authCode,
        });
    });

    router.post('/authenticateUser', async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password)
            return res.status(400).json({
                error: true,
                message: 'invalidRequest',
            });

        var userDataRes = await app.db.queryAsync('api', 'users', { username: username }).catch((error) => {
            console.error(error);
            return res.status(500).json({
                error: true,
                message: 'databaseError',
            });
        });

        if (userDataRes.length <= 0) {
            userDataRes = await app.db.queryAsync('api', 'users', { email: username }).catch((error) => {
                console.error(error);
                return res.status(500).json({
                    error: true,
                    message: 'databaseError',
                });
            });
        }

        if (userDataRes.length <= 0)
            return res.status(401).json({
                error: true,
                message: 'unknownUser',
            });

        var passwordMatch = bcrypt.compareSync(password, userDataRes[0].password);

        if (!passwordMatch)
            return res.status(401).json({
                error: true,
                message: 'passwordMismatch',
            });

        return res.status(200).json({
            error: false,
            token: app.jwt.createToken({ exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, uuid: userDataRes[0].uuid, username: userDataRes[0].username, email: userDataRes[0].email }),
        });
    });

    router.post('/isAuthenticated', async (req, res) => {
        if (!req.user)
            return res.status(401).json({
                error: true,
                message: 'unauthorized',
            });

        return res.status(200).json({
            error: false,
            message: 'authorized',
        });
    });

    router.post('/revokeToken', async (req, res) => {
        var token;
        if (!req.headers.authorization) token = req.body.authorization;
        else token = req.headers.authorization;

        if (!token)
            return res.status(401).json({
                error: true,
                message: 'unauthorized',
            });

        var data;
        try {
            data = app.jwt.verifyToken(token);
        } catch (error) {
            return res.status(401).json({
                error: false,
                message: error.message,
            });
        }

        var revokedToken = await app.db.queryAsync('api', 'revoked_tokens', { token: token });
        if (!revokedToken[0]) await app.db.insertObjectAsync('api', 'revoked_tokens', { token: token });

        return res.status(200).json({
            error: false,
            message: 'success',
        });
    });

    return router;
};
