"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { z } = require('zod');
const { objectIdSchema } = require('../models/shared/zod');
const { userZodSchemas, ROLES } = require('../models/User');
const userIdSchema = {
    params: z.object({
        id: objectIdSchema,
    }),
};
const createUserSchema = {
    body: userZodSchemas.create,
};
const updateUserSchema = {
    params: userIdSchema.params,
    body: userZodSchemas.update,
};
const listUsersSchema = {
    query: z.object({
        role: z.enum(ROLES).optional(),
        isActive: z
            .enum(['true', 'false'])
            .optional()
            .transform((value) => (value === undefined ? undefined : value === 'true')),
        emailVerified: z
            .enum(['true', 'false'])
            .optional()
            .transform((value) => (value === undefined ? undefined : value === 'true')),
        search: z.string().trim().optional(),
        sort: z.enum(['newest', 'name_asc', 'name_desc', 'role']).optional(),
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
    }),
};
module.exports = {
    userIdSchema,
    createUserSchema,
    updateUserSchema,
    listUsersSchema,
};
