"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interviewZodSchemas = exports.INTERVIEW_STATUSES = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const zod_2 = require("./shared/zod");
const INTERVIEW_STATUSES = ['scheduled', 'confirmed', 'completed', 'cancelled', 'declined'];
exports.INTERVIEW_STATUSES = INTERVIEW_STATUSES;
const interviewZodSchema = zod_1.z.object({
    jobId: zod_2.objectIdSchema,
    proposalId: zod_2.objectIdSchema,
    clientId: zod_2.objectIdSchema,
    freelancerId: zod_2.objectIdSchema,
    scheduledDate: zod_1.z.coerce.date(),
    duration: zod_1.z.number().int().positive('Duration must be at least 1 minute'),
    meetingLink: zod_2.urlSchema,
    meetingPassword: zod_1.z.string().trim().optional().or(zod_1.z.literal('')),
    notes: zod_1.z.string().trim().max(2000, 'Notes cannot exceed 2000 characters').optional().or(zod_1.z.literal('')),
    status: zod_1.z.enum(INTERVIEW_STATUSES).optional().default('scheduled'),
});
const createInterviewZodSchema = interviewZodSchema.omit({
    status: true,
    clientId: true,
});
const updateInterviewZodSchema = zod_1.z
    .object({
    scheduledDate: zod_1.z.coerce.date().optional(),
    duration: zod_1.z.number().int().positive('Duration must be at least 1 minute').optional(),
    meetingLink: zod_2.urlSchema.optional(),
    meetingPassword: zod_1.z.string().trim().optional().or(zod_1.z.literal('')),
    notes: zod_1.z.string().trim().max(2000).optional().or(zod_1.z.literal('')),
    status: zod_1.z.enum(INTERVIEW_STATUSES).optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
});
const interviewMongooseSchema = new mongoose_1.default.Schema({
    jobId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Job',
        required: [true, 'Job ID is required'],
        index: true,
    },
    proposalId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Proposal',
        required: [true, 'Proposal ID is required'],
        index: true,
    },
    clientId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Client ID is required'],
        index: true,
    },
    freelancerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Freelancer ID is required'],
        index: true,
    },
    scheduledDate: {
        type: Date,
        required: [true, 'Scheduled date is required'],
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 minute'],
    },
    meetingLink: {
        type: String,
        required: [true, 'Meeting link is required'],
        trim: true,
    },
    meetingPassword: {
        type: String,
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    status: {
        type: String,
        enum: {
            values: INTERVIEW_STATUSES,
            message: 'Status must be scheduled, confirmed, completed, cancelled, or declined',
        },
        default: 'scheduled',
        index: true,
    },
}, {
    timestamps: true,
});
interviewMongooseSchema.index({ clientId: 1, status: 1 });
interviewMongooseSchema.index({ freelancerId: 1, status: 1 });
interviewMongooseSchema.index({ scheduledDate: 1 });
const Interview = mongoose_1.default.model('Interview', interviewMongooseSchema);
exports.interviewZodSchemas = {
    schema: interviewZodSchema,
    create: createInterviewZodSchema,
    update: updateInterviewZodSchema,
};
exports.default = Interview;
