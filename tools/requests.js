// Copyright © 2021 - 2022 | 𝕷𝖚𝖈𝖎𝖋𝖊𝖗#1234 | All Rights Reserved | ( Email: contact@lucifer-morningstar.xyz )

var app = {};

module.exports = class RequestManager {
    static setApp(expressInstance) {
        if (!expressInstance) throw new Error('Express instance cannot be null.');
        app = expressInstance;
        app.requestManager = RequestManager;
    }

    /**
     * Send some data to a webhook url
     * @param {String} url
     * @param {Object} content
     */
    static async sendWebHook(url, content) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(content),
            })
                .then(() => resolve(true))
                .catch(reject);
        });
    }
};
