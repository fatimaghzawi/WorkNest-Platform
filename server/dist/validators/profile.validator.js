"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { z } = require('zod');
const { nonEmptyString, optionalE164PhoneSchema, urlSchema, objectIdSchema, } = require('../models/shared/zod');
const updateProfileSchema = {
    body: z
        .object({
        firstName: nonEmptyString('First name')
            .max(50, 'First name cannot exceed 50 characters')
            .optional(),
        lastName: nonEmptyString('Last name')
            .max(50, 'Last name cannot exceed 50 characters')
            .optional(),
        phone: optionalE164PhoneSchema.optional(),
        bio: z
            .string()
            .trim()
            .max(500, 'Bio cannot exceed 500 characters')
            .optional(),
        skills: z
            .array(z.string()
            .trim()
            .min(1))
            .optional(),
        portfolioLink: urlSchema
            .optional()
            .or(z.literal('')),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field is required for update',
    }),
};
const publicFreelancerProfileSchema = {
    params: z.object({
        freelancerId: objectIdSchema,
    }),
};
const publicClientProfileSchema = {
    params: z.object({
        clientId: objectIdSchema,
    }),
};
module.exports = {
    updateProfileSchema,
    publicFreelancerProfileSchema,
    publicClientProfileSchema,
};
