// Copyright © 2021 - 2022 | 𝕷𝖚𝖈𝖎𝖋𝖊𝖗#1234 | All Rights Reserved | ( Email: contact@lucifer-morningstar.xyz )

const express = require('express');

module.exports.path = 'ping';

module.exports.router = (app, routerPath, router = express.Router()) => {
    var router = express.Router();

    router.all('/', async (req, res) => {
        return res.status(200).json({
            error: false,
            ping: true,
            version: app.API_VERSION,
        });
    });

    return router;
};

/**
 * @api {get} v1/ping Ping the api
 * @apiName Ping
 * @apiGroup Tools
 *
 * @apiExample {curl} Example usage:
 *     curl -i https://api.mixelblocks.de/v1/ping
 *
 * @apiSuccess {Object} ping object
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "error": false,
 *       "ping": true,
 *       "version": "v1"
 *     }
 *
 */
