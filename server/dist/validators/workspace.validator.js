"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { z } = require('zod');
const { objectIdSchema, nonEmptyString } = require('../models/shared/zod');
const { TASK_STATUSES, TASK_PRIORITIES } = require('../models/Task');
const jobIdParamSchema = {
    params: z.object({
        jobId: objectIdSchema,
    }),
};
const taskIdParamSchema = {
    params: z.object({
        jobId: objectIdSchema,
        taskId: objectIdSchema,
    }),
};
const attachmentIdParamSchema = {
    params: z.object({
        jobId: objectIdSchema,
        attachmentId: objectIdSchema,
    }),
};
const createTaskSchema = {
    params: jobIdParamSchema.params,
    body: z.object({
        title: nonEmptyString('Title').max(200),
        description: z.string().trim().max(2000).optional().or(z.literal('')),
        status: z.enum(TASK_STATUSES).optional(),
        priority: z.enum(TASK_PRIORITIES).optional(),
        dueDate: z.coerce.date().nullable().optional(),
    }),
};
const updateTaskSchema = {
    params: taskIdParamSchema.params,
    body: z
        .object({
        title: nonEmptyString('Title').max(200).optional(),
        description: z.string().trim().max(2000).optional().or(z.literal('')),
        status: z.enum(TASK_STATUSES).optional(),
        priority: z.enum(TASK_PRIORITIES).optional(),
        dueDate: z.coerce.date().nullable().optional(),
    })
        .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field is required for update',
    }),
};
const listWorkspaceQuerySchema = {
    params: jobIdParamSchema.params,
    query: z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
    }),
};
module.exports = {
    jobIdParamSchema,
    taskIdParamSchema,
    attachmentIdParamSchema,
    createTaskSchema,
    updateTaskSchema,
    listWorkspaceQuerySchema,
};
