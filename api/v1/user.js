// Copyright © 2021 - 2022 | 𝕷𝖚𝖈𝖎𝖋𝖊𝖗#1234 | All Rights Reserved | ( Email: contact@lucifer-morningstar.xyz )

const express = require('express');

module.exports.path = 'user';

module.exports.router = (app, routerPath, router = express.Router()) => {
    var router = express.Router();

    router.get('/', async (req, res) => {
        if (!req.query.username)
            return res.status(404).json({
                error: true,
                message: 'not found',
            });

        app.db.query('api', 'users', { username: req.query.username }, (result, error) => {
            if (error) {
                console.error(error);
                return res.status(404).json({
                    error: true,
                    message: 'not found',
                });
            }
            try {
                if (!result[0])
                    return res.status(404).json({
                        error: true,
                        message: 'not found',
                    });

                return res.status(200).json({
                    error: false,
                    user: {
                        username: result[0].username,
                        uuid: result[0].uuid,
                        createdAt: result[0].createdAt,
                    },
                });
            } catch (err) {
                console.error(err);
                return res.status(500).json({
                    error: true,
                });
            }
        });
    });

    return router;
};
