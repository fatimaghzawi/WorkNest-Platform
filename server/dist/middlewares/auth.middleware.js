"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwtConfig = require('../config/jwt');
const { verifyAccessToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const authRepository = require('../repositories/auth.repository');
const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies?.[jwtConfig.cookie.name];
        if (!token) {
            return next(new AppError('Authentication required', 401));
        }
        const decoded = verifyAccessToken(token);
        const user = await authRepository.findByIdForAuth(decoded.id);
        if (!user || !user.isActive) {
            return next(new AppError('Authentication required', 401));
        }
        const userPwdChangedAt = user.passwordChangedAt?.getTime() || 0;
        if (userPwdChangedAt > (decoded.pwdChangedAt || 0)) {
            return next(new AppError('Session expired. Please log in again.', 401));
        }
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch {
        return next(new AppError('Invalid or expired token', 401));
    }
};
module.exports = {
    authenticate,
};
