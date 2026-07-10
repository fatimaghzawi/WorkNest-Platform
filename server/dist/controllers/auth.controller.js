"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authService = require('../services/auth.service');
const jwtConfig = require('../config/jwt');
const env = require('../config/env');
const { sendSuccess } = require('../utils/response');
const { renderEmailVerificationResultPage } = require('../views/auth.view');
const setAccessTokenCookie = (res, token) => {
    res.cookie(jwtConfig.cookie.name, token, {
        httpOnly: jwtConfig.cookie.httpOnly,
        secure: jwtConfig.cookie.secure,
        sameSite: jwtConfig.cookie.sameSite,
        maxAge: jwtConfig.cookie.maxAge,
    });
};
const clearAccessTokenCookie = (res) => {
    res.clearCookie(jwtConfig.cookie.name, {
        httpOnly: jwtConfig.cookie.httpOnly,
        secure: jwtConfig.cookie.secure,
        sameSite: jwtConfig.cookie.sameSite,
    });
};
const register = async (req, res) => {
    const result = await authService.register(req.body);
    return sendSuccess(res, {
        statusCode: 201,
        message: result.message,
    });
};
const verifyEmail = async (req, res, next) => {
    const wantsHtml = req.accepts(['html', 'json']) === 'html';
    try {
        const result = await authService.verifyEmail(req.params.token);
        if (wantsHtml) {
            return res
                .status(200)
                .send(renderEmailVerificationResultPage({
                success: true,
                title: 'Email verified!',
                message: `Your ${env.appName} account is ready. You can close this page and log in.`,
            }));
        }
        return sendSuccess(res, { message: result.message });
    }
    catch (error) {
        if (wantsHtml && error.statusCode) {
            return res
                .status(error.statusCode)
                .send(renderEmailVerificationResultPage({
                success: false,
                title: 'Verification failed',
                message: error.message || 'Invalid or expired verification link.',
            }));
        }
        return next(error);
    }
};
const login = async (req, res) => {
    const { accessToken, user } = await authService.login(req.body);
    setAccessTokenCookie(res, accessToken);
    return res.status(200).json({ success: true, user });
};
const logout = async (req, res) => {
    clearAccessTokenCookie(res);
    return sendSuccess(res, { message: 'Logged out successfully' });
};
const forgotPassword = async (req, res) => {
    const result = await authService.forgotPassword(req.body.email);
    return sendSuccess(res, { message: result.message });
};
const resetPassword = async (req, res) => {
    const result = await authService.resetPassword(req.params.token, req.body.password);
    return sendSuccess(res, { message: result.message });
};
const openResetPassword = async (req, res) => {
    const token = encodeURIComponent(req.params.token);
    return res.redirect(302, `${env.clientUrl}/reset-password/${token}`);
};
const getMe = async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);
    return res.status(200).json({ success: true, user });
};
module.exports = {
    register,
    verifyEmail,
    login,
    logout,
    forgotPassword,
    resetPassword,
    openResetPassword,
    getMe,
};
