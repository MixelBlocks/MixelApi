var jwt = require('jsonwebtoken');

module.exports = class TokenManager {
    constructor() {
        // require MongoDB Handler
        var MongoDBHandler = require('./databaseHandler');
        this.db = new MongoDBHandler(process.env.MONGO_CONNECTION);
        this.secret = process.env.JWT_SIGN;
    }
    createToken(data) {
        // this.createToken({ exp: Math.floor(Date.now() / 1000) + 60 * 60, name: 'kaka', userid: '12345678987644567' });
        return jwt.sign(data, this.secret);
    }
    verifyToken(token) {
        // var decoded = this.verifyToken(token, this.secret);
        return jwt.verify(token, this.secret);
    }
};
