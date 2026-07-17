"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError = require('../utils/AppError');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateSecureToken, hashToken } = require('../utils/token.util');
const { signAccessToken } = require('../utils/jwt');
const emailService = require('./email/email.service');
const authRepository = require('../repositories/auth.repository');
const refreshTokenRepository = require('../repositories/refreshToken.repository');
const jwtConfig = require('../config/jwt');
const googleConfig = require('../config/google');
const githubConfig = require('../config/github');
const env = require('../config/env');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { logWarning, logInfo } = require('../utils/logger');
const VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000;
const RESET_EXPIRY_MS = 15 * 60 * 1000;
const issueAccessToken = (user) => signAccessToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    pwdChangedAt: user.passwordChangedAt?.getTime() || 0,
});
const createRefreshToken = async (userId) => {
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + jwtConfig.refresh.expiresInMs);
    await refreshTokenRepository.create({
        userId,
        tokenHash,
        expiresAt,
    });
    return rawToken;
};
const revokeRefreshToken = async (rawToken) => {
    if (!rawToken)
        return;
    await refreshTokenRepository.deleteByTokenHash(hashToken(rawToken));
};
const revokeAllRefreshTokens = async (userId) => {
    await refreshTokenRepository.deleteAllForUser(userId);
};
const issueAuthSession = async (user) => {
    const accessToken = issueAccessToken(user);
    const refreshToken = await createRefreshToken(user._id.toString());
    return {
        accessToken,
        refreshToken,
        user: authRepository.sanitizeUser(user),
    };
};
const googleClient = googleConfig.isConfigured
    ? new OAuth2Client(googleConfig.clientId)
    : null;
const resolveOAuthUser = async ({ providerId, providerIdField, findByProviderId, authProvider, email, firstName, lastName, profileImage, role, providerLabel, }) => {
    let user = await findByProviderId(providerId);
    if (!user) {
        user = await authRepository.findByEmail(email);
        if (user) {
            if (user.role === 'admin') {
                throw new AppError('Admin accounts must sign in with email and password', 403);
            }
            user = await authRepository.updateUser(user._id.toString(), {
                [providerIdField]: providerId,
                emailVerified: true,
                ...(profileImage && !user.profileImage ? { profileImage } : {}),
            });
        }
    }
    if (!user) {
        if (!role) {
            throw new AppError('No account found. Please sign up and choose client or freelancer first.', 404);
        }
        user = await authRepository.createUser({
            firstName,
            lastName: lastName || firstName,
            email,
            role,
            authProvider,
            [providerIdField]: providerId,
            emailVerified: true,
            profileImage: profileImage || undefined,
        });
    }
    if (!user.isActive) {
        throw new AppError('Your account has been deactivated', 403);
    }
    if (user.role === 'admin') {
        throw new AppError('Admin accounts must sign in with email and password', 403);
    }
    logInfo(`User signed in with ${providerLabel}`, {
        source: 'auth',
        category: 'login',
        actorEmail: user.email,
        userId: user._id,
    });
    return user;
};
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
        authProvider: 'local',
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
    if (!user.password && (user.googleId || user.githubId)) {
        throw new AppError('This account uses social sign-in. Please continue with Google or GitHub.', 400);
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
    return issueAuthSession(user);
};
const googleLogin = async ({ credential, role }) => {
    if (!googleClient || !googleConfig.isConfigured) {
        throw new AppError('Google sign-in is not configured', 503);
    }
    if (!credential) {
        throw new AppError('Google credential is required', 400);
    }
    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: googleConfig.clientId,
        });
        payload = ticket.getPayload();
    }
    catch {
        throw new AppError('Invalid Google sign-in token', 401);
    }
    if (!payload?.sub || !payload.email) {
        throw new AppError('Google account information is incomplete', 400);
    }
    if (!payload.email_verified) {
        throw new AppError('Your Google email is not verified', 403);
    }
    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const firstName = payload.given_name || payload.name?.split(' ')[0] || 'User';
    const lastName = payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '';
    const profileImage = payload.picture || '';
    const user = await resolveOAuthUser({
        providerId: googleId,
        providerIdField: 'googleId',
        findByProviderId: authRepository.findByGoogleId,
        authProvider: 'google',
        email,
        firstName,
        lastName,
        profileImage,
        role,
        providerLabel: 'Google',
    });
    return issueAuthSession(user);
};
const getGithubAuthorizationUrl = (role) => {
    if (!githubConfig.isConfigured) {
        throw new AppError('GitHub sign-in is not configured', 503);
    }
    const state = jwt.sign({
        provider: 'github',
        role: role === 'client' || role === 'freelancer' ? role : null,
    }, env.jwt.secret, { expiresIn: '10m' });
    const params = new URLSearchParams({
        client_id: githubConfig.clientId,
        redirect_uri: githubConfig.callbackUrl,
        scope: 'read:user user:email',
        state,
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
};
const completeGithubOAuth = async (code, state) => {
    if (!githubConfig.isConfigured) {
        throw new AppError('GitHub sign-in is not configured', 503);
    }
    if (!code) {
        throw new AppError('GitHub authorization code is missing', 400);
    }
    if (!state) {
        throw new AppError('GitHub sign-in state is missing', 400);
    }
    let decoded;
    try {
        decoded = jwt.verify(state, env.jwt.secret);
    }
    catch {
        throw new AppError('Invalid or expired GitHub sign-in state', 400);
    }
    const role = decoded?.role || undefined;
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: githubConfig.clientId,
            client_secret: githubConfig.clientSecret,
            code,
            redirect_uri: githubConfig.callbackUrl,
        }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
        throw new AppError('Failed to authenticate with GitHub', 401);
    }
    const githubHeaders = {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
    };
    const [profileResponse, emailsResponse] = await Promise.all([
        fetch('https://api.github.com/user', { headers: githubHeaders }),
        fetch('https://api.github.com/user/emails', { headers: githubHeaders }),
    ]);
    const profile = await profileResponse.json();
    const emails = await emailsResponse.json();
    if (!profileResponse.ok || !profile?.id) {
        throw new AppError('Failed to load GitHub profile', 401);
    }
    const verifiedEmail = (Array.isArray(emails)
        ? emails.find((entry) => entry.primary && entry.verified)?.email ||
            emails.find((entry) => entry.verified)?.email
        : null) || profile.email;
    if (!verifiedEmail) {
        throw new AppError('Your GitHub account must have a verified email address', 403);
    }
    const githubId = String(profile.id);
    const email = verifiedEmail.toLowerCase();
    const nameParts = (profile.name || profile.login || 'User').trim().split(/\s+/);
    const firstName = nameParts[0] || profile.login || 'User';
    const lastName = nameParts.slice(1).join(' ');
    const profileImage = profile.avatar_url || '';
    const user = await resolveOAuthUser({
        providerId: githubId,
        providerIdField: 'githubId',
        findByProviderId: authRepository.findByGithubId,
        authProvider: 'github',
        email,
        firstName,
        lastName,
        profileImage,
        role,
        providerLabel: 'GitHub',
    });
    return issueAuthSession(user);
};
const refreshSession = async (rawRefreshToken) => {
    if (!rawRefreshToken) {
        throw new AppError('Refresh token required', 401);
    }
    const tokenHash = hashToken(rawRefreshToken);
    const stored = await refreshTokenRepository.findByTokenHash(tokenHash);
    if (!stored) {
        throw new AppError('Invalid or expired refresh token', 401);
    }
    const user = await authRepository.findByIdForAuth(stored.userId.toString());
    if (!user || !user.isActive) {
        await refreshTokenRepository.deleteByTokenHash(tokenHash);
        throw new AppError('Authentication required', 401);
    }
    await refreshTokenRepository.deleteByTokenHash(tokenHash);
    return issueAuthSession(user);
};
const forgotPassword = async (email) => {
    const message = 'If the email exists, a reset link has been sent.';
    const user = await authRepository.findByEmail(email);
    if (!user) {
        return { message };
    }
    if (user.authProvider === 'google' || user.authProvider === 'github' || !user.password) {
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
    await revokeAllRefreshTokens(user._id.toString());
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
    googleLogin,
    getGithubAuthorizationUrl,
    completeGithubOAuth,
    refreshSession,
    revokeRefreshToken,
    revokeAllRefreshTokens,
    forgotPassword,
    resetPassword,
    getCurrentUser,
};
