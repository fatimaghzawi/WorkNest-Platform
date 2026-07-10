"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require('path');
const dotenv = require('dotenv');
const { z } = require('zod');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const emptyToUndefined = (value) => (value === '' ? undefined : value);
const isProductionSecret = (value) => Boolean(value) && !value.startsWith('dev_') && !value.startsWith('your_');
const isEmailConfigured = (data) => Boolean(data.SENDGRID_API_KEY) ||
    Boolean(data.ELASTICEMAIL_API_KEY) ||
    (Boolean(data.EMAIL_USER) && Boolean(data.EMAIL_PASS));
const envSchema = z
    .object({
    NODE_ENV: z.preprocess(emptyToUndefined, z.enum(['development', 'production', 'test']).default('development')),
    PORT: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(5000)),
    MONGO_URI: z.preprocess(emptyToUndefined, z.string().min(1).default('mongodb://127.0.0.1:27017/worknest')),
    JWT_SECRET: z.preprocess(emptyToUndefined, z.string().min(1).default('dev_jwt_secret_change_in_production')),
    JWT_EXPIRES_IN: z.preprocess(emptyToUndefined, z.string().default('1d')),
    JWT_REFRESH_SECRET: z.preprocess(emptyToUndefined, z.string().min(1).default('dev_refresh_secret_change_in_production')),
    JWT_REFRESH_EXPIRES_IN: z.preprocess(emptyToUndefined, z.string().default('30d')),
    JWT_COOKIE_EXPIRES_IN: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(7)),
    CLOUDINARY_CLOUD_NAME: z.preprocess(emptyToUndefined, z.string().default('')),
    CLOUDINARY_API_KEY: z.preprocess(emptyToUndefined, z.string().default('')),
    CLOUDINARY_API_SECRET: z.preprocess(emptyToUndefined, z.string().default('')),
    EMAIL_HOST: z.preprocess(emptyToUndefined, z.string().default('smtp-relay.brevo.com')),
    EMAIL_PORT: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(587)),
    EMAIL_SECURE: z.preprocess(emptyToUndefined, z
        .string()
        .default('false')
        .transform((value) => value === 'true')),
    EMAIL_USER: z.preprocess(emptyToUndefined, z.string().default('')),
    EMAIL_PASS: z.preprocess(emptyToUndefined, z.string().default('')),
    EMAIL_FROM: z.preprocess(emptyToUndefined, z.string().default('WorkNest <no-reply@worknest.com>')),
    SENDGRID_API_KEY: z.preprocess(emptyToUndefined, z.string().default('')),
    ELASTICEMAIL_API_KEY: z.preprocess(emptyToUndefined, z.string().default('')),
    APP_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
    APP_NAME: z.preprocess(emptyToUndefined, z.string().default('WorkNest')),
    CLIENT_URL: z.preprocess(emptyToUndefined, z.string().url().default('http://localhost:5173')),
    STRIPE_SECRET_KEY: z.preprocess(emptyToUndefined, z.string().default('')),
    STRIPE_WEBHOOK_SECRET: z.preprocess(emptyToUndefined, z.string().default('')),
    RATE_LIMIT_WINDOW_MS: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(15 * 60 * 1000)),
    RATE_LIMIT_MAX_REQUESTS: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(500)),
    MAX_FILE_SIZE: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().default(5 * 1024 * 1024)),
    UPLOAD_PATH: z.preprocess(emptyToUndefined, z.string().default('uploads')),
})
    .superRefine((data, ctx) => {
    if (data.NODE_ENV !== 'production')
        return;
    const productionRules = [
        {
            field: 'MONGO_URI',
            valid: (value) => Boolean(value) && !value.includes('127.0.0.1'),
            message: 'MONGO_URI must be set to a production database',
        },
        {
            field: 'JWT_SECRET',
            valid: isProductionSecret,
            message: 'JWT_SECRET must be set to a secure production value',
        },
        {
            field: 'JWT_REFRESH_SECRET',
            valid: isProductionSecret,
            message: 'JWT_REFRESH_SECRET must be set to a secure production value',
        },
        {
            field: 'APP_URL',
            valid: (value) => Boolean(value) &&
                !value.includes('localhost') &&
                !value.includes('127.0.0.1'),
            message: 'APP_URL must be your public URL (e.g. https://worknest-17xd.onrender.com)',
        },
        {
            field: 'CLIENT_URL',
            valid: (value) => Boolean(value) &&
                !value.includes('localhost') &&
                !value.includes('127.0.0.1'),
            message: 'CLIENT_URL must be your deployed frontend URL (e.g. https://worknest-web.onrender.com)',
        },
        {
            field: 'SENDGRID_API_KEY',
            valid: () => isEmailConfigured(data),
            message: 'Set ELASTICEMAIL_API_KEY (recommended), SENDGRID_API_KEY, or EMAIL_USER + EMAIL_PASS for SMTP (local dev only)',
        },
        {
            field: 'STRIPE_SECRET_KEY',
            valid: (value) => Boolean(value) && value.startsWith('sk_'),
            message: 'STRIPE_SECRET_KEY must be set to your Stripe secret key',
        },
        {
            field: 'STRIPE_WEBHOOK_SECRET',
            valid: (value) => Boolean(value) && value.startsWith('whsec_'),
            message: 'STRIPE_WEBHOOK_SECRET must be set to your Stripe webhook signing secret',
        },
    ];
    productionRules.forEach(({ field, valid, message }) => {
        if (!valid(data[field])) {
            ctx.addIssue({
                code: 'custom',
                message,
                path: [field],
            });
        }
    });
});
const parseEnv = () => {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        console.error('Invalid environment variables:');
        result.error.issues.forEach((issue) => {
            const field = issue.path.join('.') || 'environment';
            console.error(`  - ${field}: ${issue.message}`);
        });
        process.exit(1);
    }
    return result.data;
};
const parsed = parseEnv();
const env = {
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
    isProduction: parsed.NODE_ENV === 'production',
    mongoUri: parsed.MONGO_URI,
    jwt: {
        secret: parsed.JWT_SECRET,
        expiresIn: parsed.JWT_EXPIRES_IN,
        refreshSecret: parsed.JWT_REFRESH_SECRET,
        refreshExpiresIn: parsed.JWT_REFRESH_EXPIRES_IN,
        cookieExpiresIn: parsed.JWT_COOKIE_EXPIRES_IN,
    },
    cloudinary: {
        cloudName: parsed.CLOUDINARY_CLOUD_NAME,
        apiKey: parsed.CLOUDINARY_API_KEY,
        apiSecret: parsed.CLOUDINARY_API_SECRET,
    },
    email: {
        host: parsed.EMAIL_HOST,
        port: parsed.EMAIL_PORT,
        secure: parsed.EMAIL_SECURE,
        user: parsed.EMAIL_USER,
        pass: parsed.EMAIL_PASS,
        from: parsed.EMAIL_FROM,
        sendgridApiKey: parsed.SENDGRID_API_KEY,
        elasticEmailApiKey: parsed.ELASTICEMAIL_API_KEY,
        isConfigured: isEmailConfigured(parsed),
        provider: parsed.SENDGRID_API_KEY
            ? 'sendgrid'
            : parsed.ELASTICEMAIL_API_KEY
                ? 'elasticemail'
                : parsed.EMAIL_USER && parsed.EMAIL_PASS
                    ? 'smtp'
                    : 'ethereal',
    },
    appUrl: parsed.APP_URL || `http://localhost:${parsed.PORT}`,
    appName: parsed.APP_NAME,
    clientUrl: parsed.CLIENT_URL,
    stripe: {
        secretKey: parsed.STRIPE_SECRET_KEY,
        webhookSecret: parsed.STRIPE_WEBHOOK_SECRET,
        isConfigured: Boolean(parsed.STRIPE_SECRET_KEY),
    },
    rateLimit: {
        windowMs: parsed.RATE_LIMIT_WINDOW_MS,
        maxRequests: parsed.RATE_LIMIT_MAX_REQUESTS,
    },
    upload: {
        maxFileSize: parsed.MAX_FILE_SIZE,
        path: parsed.UPLOAD_PATH,
    },
};
module.exports = env;
