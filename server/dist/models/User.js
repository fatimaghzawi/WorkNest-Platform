"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userZodSchemas = exports.ROLES = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const zod_2 = require("./shared/zod");
const ROLES = ['client', 'freelancer', 'admin'];
exports.ROLES = ROLES;
const userZodSchema = zod_1.z.object({
    firstName: (0, zod_2.nonEmptyString)('First name').max(50, 'First name cannot exceed 50 characters'),
    lastName: (0, zod_2.nonEmptyString)('Last name').max(50, 'Last name cannot exceed 50 characters'),
    email: zod_1.z.string().trim().email('Invalid email address').toLowerCase(),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters'),
    role: zod_1.z.enum(ROLES, { message: 'Role must be client, freelancer, or admin' }),
    phone: zod_2.optionalE164PhoneSchema,
    profileImage: zod_2.urlSchema.optional().or(zod_1.z.literal('')),
    bio: zod_1.z.string().trim().max(500, 'Bio cannot exceed 500 characters').optional(),
    skills: zod_1.z.array(zod_1.z.string().trim().min(1)).optional().default([]),
    portfolioLink: zod_2.urlSchema.optional().or(zod_1.z.literal('')),
    isActive: zod_1.z.boolean().optional().default(true),
    emailVerified: zod_1.z.boolean().optional().default(false),
});
const createUserZodSchema = userZodSchema;
// No .default() here — partial() + defaults would inject emailVerified:false / skills:[] on every PATCH.
const updateUserZodSchema = zod_1.z
    .object({
    firstName: (0, zod_2.nonEmptyString)('First name').max(50, 'First name cannot exceed 50 characters').optional(),
    lastName: (0, zod_2.nonEmptyString)('Last name').max(50, 'Last name cannot exceed 50 characters').optional(),
    role: zod_1.z.enum(ROLES, { message: 'Role must be client, freelancer, or admin' }).optional(),
    phone: zod_2.optionalE164PhoneSchema,
    profileImage: zod_2.urlSchema.optional().or(zod_1.z.literal('')),
    bio: zod_1.z.string().trim().max(500, 'Bio cannot exceed 500 characters').optional(),
    skills: zod_1.z.array(zod_1.z.string().trim().min(1)).optional(),
    portfolioLink: zod_2.urlSchema.optional().or(zod_1.z.literal('')),
    isActive: zod_1.z.boolean().optional(),
    emailVerified: zod_1.z.boolean().optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
});
const userMongooseSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false,
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: {
            values: ROLES,
            message: 'Role must be client, freelancer, or admin',
        },
        index: true,
    },
    phone: {
        type: String,
        trim: true,
        match: [/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format'],
    },
    profileImage: {
        type: String,
        trim: true,
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    skills: {
        type: [String],
        default: [],
        index: true,
    },
    portfolioLink: {
        type: String,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    emailVerified: {
        type: Boolean,
        default: false,
        index: true,
    },
    emailVerificationToken: {
        type: String,
        select: false,
    },
    emailVerificationExpires: {
        type: Date,
        select: false,
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
    passwordChangedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
const User = mongoose_1.default.model('User', userMongooseSchema);
exports.userZodSchemas = {
    schema: userZodSchema,
    create: createUserZodSchema,
    update: updateUserZodSchema,
};
exports.default = User;
