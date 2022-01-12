// Copyright © 2021 - 2022 | 𝕷𝖚𝖈𝖎𝖋𝖊𝖗#1234 | All Rights Reserved | ( Email: contact@lucifer-morningstar.xyz )

const express = require('express');

module.exports.path = 'eco';

module.exports.router = (app, routerPath, router = express.Router()) => {
    var router = express.Router();

    router.post('/getUserBalance', async (req, res) => {
        res.status(200).json({ error: false });
    });

    router.post('/getUserTransactions', async (req, res) => {
        res.status(200).json({ error: false });
    });

    router.post('/getClanBalance', async (req, res) => {
        res.status(200).json({ error: false });
    });

    router.post('/getClanTransactions', async (req, res) => {
        res.status(200).json({ error: false });
    });

    return router;
};
