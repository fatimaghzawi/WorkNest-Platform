"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwtConfig = require('../config/jwt');
/** Read JWT from httpOnly cookie (preferred) or Authorization: Bearer header (mobile fallback). */
const extractAccessToken = (req) => {
    const cookieToken = req.cookies?.[jwtConfig.cookie.name];
    if (cookieToken)
        return cookieToken;
    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const bearerToken = authHeader.slice(7).trim();
        if (bearerToken)
            return bearerToken;
    }
    return null;
};
module.exports = { extractAccessToken };
