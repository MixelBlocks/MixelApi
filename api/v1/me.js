// Copyright © 2021 - 2022 | 𝕷𝖚𝖈𝖎𝖋𝖊𝖗#1234 | All Rights Reserved | ( Email: contact@lucifer-morningstar.xyz )

const express = require('express');

module.exports.path = 'me';

module.exports.router = (app, routerPath, router = express.Router()) => {
    var router = express.Router();

    var handleMe = async (req, res) => {
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
                profile: {
                    avatar: req.user.profile.avatar,
                    status: req.user.profile.status,
                    status_emoji: req.user.profile.status_emoji,
                    bio: req.user.profile.bio,
                    createdAt: req.user.profile.createdAt,
                },
            },
        });
    };

    router.post('/', handleMe);
    router.get('/', handleMe);

    return router;
};

/**
 * @api {get} v1/me/ Get the current logged in user data
 * @apiName Me
 * @apiGroup UserManagement
 *
 * @apiExample {curl} Example usage:
 *     curl -H "Authorization: UserToken" -i https://api.mixelblocks.de/v1/me
 *
 * @apiHeader [Authorization token] Authorization=jsonwebtoken Authorization by jwt
 *
 * @apiSuccess {Object} user object
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "uuid": "userData.uuid",
 *       "username": "userData.username",
 *       "email": "userData.email",
 *       "groups": "userData.groups = []",
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
 * @api {post} v1/user/ Get the current logged in user data
 * @apiName Me
 * @apiGroup UserManagement
 *
 * @apiExample {curl} Example usage:
 *     curl -i https://api.mixelblocks.de/v1/me -d '{"authorization": "token"}'
 *
 * @apiSuccess {Object} user object
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "uuid": "userData.uuid",
 *       "username": "userData.username",
 *       "email": "userData.email",
 *       "groups": "userData.groups = []",
 *       "createdAt": "userData.createdAt",
 *       "minecraft": {
 *         "username": "userData.minecraft.username",
 *         "uuid": "userData.minecraft.uuid"
 *       },
 *       "profile": "userProfileData"
 *     }
 *
 */
