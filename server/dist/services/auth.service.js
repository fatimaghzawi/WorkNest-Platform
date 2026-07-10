"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError = require('../utils/AppError');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateSecureToken, hashToken } = require('../utils/token.util');
const { signAccessToken } = require('../utils/jwt');
const emailService = require('./email/email.service');
const authRepository = require('../repositories/auth.repository');
const { logWarning, logInfo } = require('../utils/logger');
const VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000;
const RESET_EXPIRY_MS = 15 * 60 * 1000;
const register = async ({ firstName, lastName, email, password, role }) => {
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
        throw new AppError('Email already exists', 409);
    }
    const rawVerificationToken = generateSecureToken();
    const hashedVerificationToken = hashToken(rawVerificationToken);
    const hashedPassword = await hashPassword(password);
    const user = await authRepository.createUser({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        emailVerified: false,
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpires: new Date(Date.now() + VERIFICATION_EXPIRY_MS),
    });
    try {
        await emailService.sendVerificationEmail({
            to: email,
            firstName,
            token: rawVerificationToken,
        });
    }
    catch (error) {
        console.error('[AuthService] Verification email failed:', error.message);
        if (error.code) {
            console.error('[AuthService] Email error code:', error.code);
        }
        await authRepository.deleteUser(user._id.toString());
        throw new AppError('Registration failed. Could not send verification email.', 500);
    }
    return { message: 'Registration successful. Please check your email to verify your account.' };
};
const verifyEmail = async (token) => {
    const hashedToken = hashToken(token);
    const user = await authRepository.findByVerificationToken(hashedToken);
    if (!user) {
        throw new AppError('Invalid or expired verification link', 400);
    }
    if (user.emailVerified) {
        throw new AppError('Email is already verified', 400);
    }
    await authRepository.updateUser(user._id.toString(), {
        emailVerified: true,
        $unset: {
            emailVerificationToken: 1,
            emailVerificationExpires: 1,
        },
    });
    return { message: 'Email verified successfully. You can now log in.' };
};
const login = async ({ email, password }) => {
    const user = await authRepository.findByEmail(email, true);
    if (!user) {
        logWarning('Failed login attempt — unknown email', {
            source: 'auth',
            category: 'login',
            actorEmail: email,
        });
        throw new AppError('Invalid email or password', 401);
    }
    if (!user.emailVerified) {
        logWarning('Login blocked — email not verified', {
            source: 'auth',
            category: 'login',
            actorEmail: email,
            userId: user._id,
        });
        throw new AppError('Please verify your email before logging in', 403);
    }
    if (!user.isActive) {
        logWarning('Login blocked — account deactivated', {
            source: 'auth',
            category: 'login',
            actorEmail: email,
            userId: user._id,
        });
        throw new AppError('Your account has been deactivated', 403);
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        logWarning('Failed login attempt — invalid password', {
            source: 'auth',
            category: 'login',
            actorEmail: email,
            userId: user._id,
        });
        throw new AppError('Invalid email or password', 401);
    }
    logInfo('User signed in successfully', {
        source: 'auth',
        category: 'login',
        actorEmail: user.email,
        userId: user._id,
    });
    const accessToken = signAccessToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        pwdChangedAt: user.passwordChangedAt?.getTime() || 0,
    });
    return {
        accessToken,
        user: authRepository.sanitizeUser(user),
    };
};
const forgotPassword = async (email) => {
    const message = 'If the email exists, a reset link has been sent.';
    const user = await authRepository.findByEmail(email);
    if (!user) {
        return { message };
    }
    const rawResetToken = generateSecureToken();
    const hashedResetToken = hashToken(rawResetToken);
    await authRepository.updateUser(user._id.toString(), {
        passwordResetToken: hashedResetToken,
        passwordResetExpires: new Date(Date.now() + RESET_EXPIRY_MS),
    });
    void emailService
        .sendPasswordResetEmail({
        to: user.email,
        firstName: user.firstName,
        token: rawResetToken,
    })
        .catch(async (error) => {
        console.error('[AuthService] Password reset email failed:', error.message);
        if (error.code) {
            console.error('[AuthService] Email error code:', error.code);
        }
        try {
            await authRepository.updateUser(user._id.toString(), {
                $unset: {
                    passwordResetToken: 1,
                    passwordResetExpires: 1,
                },
            });
        }
        catch (cleanupError) {
            console.error('[AuthService] Failed to clear reset token:', cleanupError.message);
        }
    });
    return { message };
};
const resetPassword = async (token, password) => {
    const hashedToken = hashToken(token);
    const user = await authRepository.findByPasswordResetToken(hashedToken);
    if (!user) {
        throw new AppError('Invalid or expired reset token', 400);
    }
    const hashedPassword = await hashPassword(password);
    await authRepository.updateUser(user._id.toString(), {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        $unset: {
            passwordResetToken: 1,
            passwordResetExpires: 1,
        },
    });
    return { message: 'Password reset successfully. You can now log in with your new password.' };
};
const getCurrentUser = async (userId) => {
    const user = await authRepository.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    if (!user.isActive) {
        throw new AppError('Your account has been deactivated', 403);
    }
    return authRepository.sanitizeUser(user);
};
module.exports = {
    register,
    verifyEmail,
    login,
    forgotPassword,
    resetPassword,
    getCurrentUser,
};
