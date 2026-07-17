"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { z } = require('zod');
const { nonEmptyString } = require('../models/shared/zod');
const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters');
const registerSchema = {
    body: z.object({
        firstName: nonEmptyString('First name').max(50, 'First name cannot exceed 50 characters'),
        lastName: nonEmptyString('Last name').max(50, 'Last name cannot exceed 50 characters'),
        email: z.string().trim().email('Invalid email address').toLowerCase(),
        password: passwordSchema,
        role: z.enum(['client', 'freelancer'], {
            message: 'Role must be client or freelancer',
        }),
    }),
};
const loginSchema = {
    body: z.object({
        email: z.string().trim().email('Invalid email address').toLowerCase(),
        password: z.string().min(1, 'Password is required'),
    }),
};
const forgotPasswordSchema = {
    body: z.object({
        email: z.string().trim().email('Invalid email address').toLowerCase(),
    }),
};
const resetPasswordSchema = {
    params: z.object({
        token: z.string().min(1, 'Reset token is required'),
    }),
    body: z.object({
        password: passwordSchema,
    }),
};
const verifyEmailSchema = {
    params: z.object({
        token: z.string().min(1, 'Verification token is required'),
    }),
};
const googleLoginSchema = {
    body: z.object({
        credential: z.string().min(1, 'Google credential is required'),
        role: z.enum(['client', 'freelancer']).optional(),
    }),
};
const githubStartSchema = {
    query: z.object({
        role: z.enum(['client', 'freelancer']).optional(),
    }),
};
module.exports = {
    registerSchema,
    loginSchema,
    googleLoginSchema,
    githubStartSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
};
