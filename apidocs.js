// Copyright © 2021 - 2022 | 𝕷𝖚𝖈𝖎𝖋𝖊𝖗#1234 | All Rights Reserved | ( Email: contact@lucifer-morningstar.xyz )

var path = require('path');
var { createDoc } = require('apidoc');

const doc = createDoc({
    src: [path.resolve(__dirname, 'api')],
    dest: path.resolve(__dirname, 'docs'),
    silent: true,
});

if (typeof doc !== 'boolean') {
    console.error('Documentation creation done');
} else {
    console.error('Documentation creation failed');
}
