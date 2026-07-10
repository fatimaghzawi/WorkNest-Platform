"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const signAccessToken = (payload) => {
    return jwt.sign({
        id: payload.id,
        email: payload.email,
        role: payload.role,
        pwdChangedAt: payload.pwdChangedAt || 0,
    }, jwtConfig.access.secret, { expiresIn: jwtConfig.access.expiresIn });
};
const verifyAccessToken = (token) => {
    return jwt.verify(token, jwtConfig.access.secret);
};
module.exports = {
    signAccessToken,
    verifyAccessToken,
};
