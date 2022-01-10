// Copyright © 2021 - 2022 | 𝕷𝖚𝖈𝖎𝖋𝖊𝖗#1234 | All Rights Reserved | ( Email: contact@lucifer-morningstar.xyz )

const express = require('express');

module.exports.path = 'me';

module.exports.router = (app, routerPath, router = express.Router()) => {
    var router = express.Router();

    router.get('/', async (req, res) => {
        if (!req.user)
            return res.status(401).json({
                error: true,
                message: 'unauthorized',
            });

        return res.status(200).json({
            error: false,
            user: {
                username: req.user.username,
                email: req.user.email,
                uuid: req.user.uuid,
                createdAt: req.user.createdAt,
                groups: req.user.groups,
                minecraft: req.user.minecraft,
            },
        });
    });

    return router;
};
