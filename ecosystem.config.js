// Copyright © 2021 - 2022 | 𝕷𝖚𝖈𝖎𝖋𝖊𝖗#1234 | All Rights Reserved | ( Email: contact@lucifer-morningstar.xyz )

module.exports = {
    apps: [
        {
            name: 'mixel-api',
            script: 'server.js',
            cwd: '.',
            instances: 1,
            exec_mode: 'fork',
            watch: true,
            autorestart: true,
        },
    ],
};
