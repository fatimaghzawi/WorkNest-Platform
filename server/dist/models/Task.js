"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskZodSchemas = exports.TASK_ORIGINS = exports.TASK_PRIORITIES = exports.TASK_STATUSES = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const zod_2 = require("./shared/zod");
const TASK_STATUSES = ['todo', 'in_progress', 'review', 'done'];
exports.TASK_STATUSES = TASK_STATUSES;
const TASK_PRIORITIES = ['low', 'medium', 'high'];
exports.TASK_PRIORITIES = TASK_PRIORITIES;
const TASK_ORIGINS = ['client', 'freelancer'];
exports.TASK_ORIGINS = TASK_ORIGINS;
const taskZodSchema = zod_1.z.object({
    jobId: zod_2.objectIdSchema,
    title: (0, zod_2.nonEmptyString)('Title').max(200, 'Title cannot exceed 200 characters'),
    description: zod_1.z
        .string()
        .trim()
        .max(2000, 'Description cannot exceed 2000 characters')
        .optional()
        .or(zod_1.z.literal('')),
    status: zod_1.z.enum(TASK_STATUSES).optional().default('todo'),
    priority: zod_1.z.enum(TASK_PRIORITIES).optional().default('medium'),
    origin: zod_1.z.enum(TASK_ORIGINS).optional(),
    dueDate: zod_1.z.coerce.date().optional().nullable(),
    createdBy: zod_2.objectIdSchema.optional(),
    submissionNotes: zod_1.z.string().trim().max(2000).optional().or(zod_1.z.literal('')),
    submittedAt: zod_1.z.coerce.date().optional().nullable(),
});
const createTaskZodSchema = taskZodSchema.omit({ createdBy: true });
const updateTaskZodSchema = zod_1.z
    .object({
    title: (0, zod_2.nonEmptyString)('Title').max(200).optional(),
    description: zod_1.z.string().trim().max(2000).optional().or(zod_1.z.literal('')),
    status: zod_1.z.enum(TASK_STATUSES).optional(),
    priority: zod_1.z.enum(TASK_PRIORITIES).optional(),
    dueDate: zod_1.z.coerce.date().nullable().optional(),
    submissionNotes: zod_1.z.string().trim().max(2000).optional().or(zod_1.z.literal('')),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
});
const taskMongooseSchema = new mongoose_1.default.Schema({
    jobId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Job',
        required: [true, 'Job ID is required'],
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
        type: String,
        enum: {
            values: TASK_STATUSES,
            message: 'Status must be todo, in_progress, review, or done',
        },
        default: 'todo',
        index: true,
    },
    priority: {
        type: String,
        enum: {
            values: TASK_PRIORITIES,
            message: 'Priority must be low, medium, or high',
        },
        default: 'medium',
        index: true,
    },
    origin: {
        type: String,
        enum: {
            values: TASK_ORIGINS,
            message: 'Origin must be client or freelancer',
        },
        index: true,
    },
    dueDate: {
        type: Date,
        index: true,
    },
    submissionNotes: {
        type: String,
        trim: true,
        maxlength: [2000, 'Submission notes cannot exceed 2000 characters'],
    },
    submittedAt: {
        type: Date,
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator is required'],
    },
}, {
    timestamps: true,
});
taskMongooseSchema.index({ jobId: 1, status: 1 });
taskMongooseSchema.index({ jobId: 1, createdAt: -1 });
taskMongooseSchema.index({ jobId: 1, origin: 1, createdAt: -1 });
const Task = mongoose_1.default.model('Task', taskMongooseSchema);
exports.taskZodSchemas = {
    schema: taskZodSchema,
    create: createTaskZodSchema,
    update: updateTaskZodSchema,
};
exports.default = Task;
