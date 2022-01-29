// Copyright © 2021 - 2022 | 𝕷𝖚𝖈𝖎𝖋𝖊𝖗#1234 | All Rights Reserved | ( Email: contact@lucifer-morningstar.xyz )

const express = require('express');

module.exports.path = 'user';

module.exports.router = (app, routerPath, router = express.Router()) => {
    var router = express.Router();

    var handleUser = async (req, res) => {
        var requested = req.body.user || req.body.uuid || req.body.username || req.query.user || req.query.username || req.query.uuid;
        if (!requested)
            return res.status(404).json({
                error: true,
                message: 'not found',
            });

        var userData = app.users[requested];
        if (!userData) {
            var u = await app.db.queryAsync('api', 'users', { username: requested });
            userData = u[0];
            app.users[requested] = userData[0];
        }
        if (!userData) {
            var u = await app.db.queryAsync('api', 'users', { uuid: requested });
            userData = u[0];
            app.users[requested] = userData;
        }

        if (!userData)
            return res.status(404).json({
                error: true,
                message: 'not found',
            });

        var userProfileData = app.users[requested];
        if (!userProfileData) {
            var u = await app.db.queryAsync('api', 'profiles', { user: userData.uuid });
            userProfileData = u[0];
            app.profiles[requested] = userProfileData[0];
        }

        if (!userProfileData) userProfileData = {};

        delete userProfileData.user;
        delete userProfileData._id;

        var user = {
            uuid: userData.uuid,
            username: userData.username,
            createdAt: userData.createdAt,
            minecraft: {
                username: userData.minecraft.username,
                uuid: userData.minecraft.uuid,
            },
            profile: userProfileData,
        };

        res.status(200).json({
            error: false,
            user: user,
        });
    };

    router.get('/', handleUser);
    router.post('/', handleUser);

    return router;
};

/**
 * @api {get} v1/user/ Get the public data of a user
 * @apiName User
 * @apiGroup UserManagement
 *
 * @apiExample {curl} Example usage:
 *     curl -i https://api.mixelblocks.de/v1/user?user=lucifer1234
 *
 * @apiSuccess {Object} user object
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "uuid": "userData.uuid",
 *       "username": "userData.username",
 *       "createdAt": "userData.createdAt",
 *       "minecraft": {
 *         "username": "userData.minecraft.username",
 *         "uuid": "userData.minecraft.uuid"
 *       },
 *       "profile": "userProfileData"
 *     }
 *
 */

/**
 * @api {post} v1/user/ Get the public data of a user
 * @apiName User
 * @apiGroup UserManagement
 *
 * @apiExample {curl} Example usage:
 *     curl -i https://api.mixelblocks.de/v1/user -d '{"user": "lucifer1234"}'
 *
 * @apiSuccess {Object} user object
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "uuid": "userData.uuid",
 *       "username": "userData.username",
 *       "createdAt": "userData.createdAt",
 *       "minecraft": {
 *         "username": "userData.minecraft.username",
 *         "uuid": "userData.minecraft.uuid"
 *       },
 *       "profile": "userProfileData"
 *     }
 *
 */
