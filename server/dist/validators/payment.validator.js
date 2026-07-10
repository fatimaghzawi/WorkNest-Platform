"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { z } = require('zod');
const { PAYMENT_STATUSES } = require('../models/Payment');
const { objectIdSchema } = require('../models/shared/zod');
const projectIdSchema = {
    params: z.object({
        projectId: objectIdSchema,
    }),
};
const createCheckoutSessionSchema = {
    params: z.object({
        projectId: objectIdSchema,
    }),
    body: z.object({
        returnPath: z
            .string()
            .trim()
            .regex(/^\/[a-zA-Z0-9/_?=&%-]*$/, 'returnPath must be a relative app path')
            .optional(),
    }),
};
const confirmCheckoutSchema = {
    params: z.object({
        projectId: objectIdSchema,
    }),
    body: z.object({
        sessionId: z.string().trim().min(1).optional(),
    }),
};
const listPaymentsSchema = {
    query: z.object({
        status: z.enum(PAYMENT_STATUSES).optional(),
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
    }),
};
module.exports = {
    projectIdSchema,
    createCheckoutSessionSchema,
    confirmCheckoutSchema,
    listPaymentsSchema,
};
