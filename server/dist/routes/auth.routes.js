"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const asyncHandler = require('../utils/asyncHandler');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema, googleLoginSchema, githubStartSchema, } = require('../validators/auth.validator');
const router = Router();
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV !== 'production',
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
    },
});
router.post('/register', authLimiter, validate(registerSchema), asyncHandler(authController.register));
router.get('/verify-email/:token', authLimiter, validate(verifyEmailSchema), asyncHandler(authController.verifyEmail));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));
router.post('/google', authLimiter, validate(googleLoginSchema), asyncHandler(authController.googleLogin));
router.get('/github', authLimiter, validate(githubStartSchema), asyncHandler(authController.startGithubAuth));
router.get('/github/callback', authLimiter, asyncHandler(authController.githubCallback));
router.post('/refresh', authLimiter, asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
router.get('/reset-password/:token', authLimiter, validate(verifyEmailSchema), asyncHandler(authController.openResetPassword));
router.post('/reset-password/:token', authLimiter, validate(resetPasswordSchema), asyncHandler(authController.resetPassword));
router.get('/me', authenticate, asyncHandler(authController.getMe));
module.exports = router;
