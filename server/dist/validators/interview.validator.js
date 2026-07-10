"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { z } = require('zod');
const { objectIdSchema, urlSchema, nonEmptyString } = require('../models/shared/zod');
const { INTERVIEW_STATUSES } = require('../models/Interview');
const interviewIdSchema = {
    params: z.object({
        id: objectIdSchema,
    }),
};
const createInterviewSchema = {
    body: z.object({
        jobId: objectIdSchema,
        proposalId: objectIdSchema,
        freelancerId: objectIdSchema.optional(),
        scheduledDate: z.coerce.date(),
        duration: z.number().int().positive('Duration must be at least 1 minute'),
        meetingLink: urlSchema,
        meetingPassword: z.string().trim().optional().or(z.literal('')),
        notes: z.string().trim().max(2000).optional().or(z.literal('')),
    }),
};
const updateInterviewSchema = {
    params: interviewIdSchema.params,
    body: z
        .object({
        scheduledDate: z.coerce.date().optional(),
        duration: z.number().int().positive().optional(),
        meetingLink: urlSchema.optional(),
        meetingPassword: z.string().trim().optional().or(z.literal('')),
        notes: z.string().trim().max(2000).optional().or(z.literal('')),
        status: z.enum(INTERVIEW_STATUSES).optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field is required for update',
    }),
};
const listInterviewsSchema = {
    query: z.object({
        status: z.enum(INTERVIEW_STATUSES).optional(),
        year: z.coerce.number().int().min(1970).max(2100).optional(),
        month: z.coerce.number().int().min(0).max(11).optional(),
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(200).optional(),
    }),
};
module.exports = {
    interviewIdSchema,
    createInterviewSchema,
    updateInterviewSchema,
    listInterviewsSchema,
};
