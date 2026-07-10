"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectZodSchemas = exports.PROJECT_STATUSES = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const zod_2 = require("./shared/zod");
const PROJECT_STATUSES = ['active', 'pending_review', 'completed', 'cancelled'];
exports.PROJECT_STATUSES = PROJECT_STATUSES;
const projectZodSchema = zod_1.z.object({
    jobId: zod_2.objectIdSchema,
    clientId: zod_2.objectIdSchema,
    freelancerId: zod_2.objectIdSchema,
    title: (0, zod_2.nonEmptyString)('Title'),
    status: zod_1.z.enum(PROJECT_STATUSES).optional().default('active'),
    progress: zod_2.progressSchema.optional().default(0),
    githubLink: zod_2.urlSchema.optional().or(zod_1.z.literal('')),
    deliveryNotes: zod_1.z.string().trim().max(2000).optional().or(zod_1.z.literal('')),
    reviewNotes: zod_1.z.string().trim().max(2000).optional().or(zod_1.z.literal('')),
    submittedAt: zod_1.z.coerce.date().optional().nullable(),
});
const createProjectZodSchema = projectZodSchema.omit({ status: true, progress: true });
const updateProjectZodSchema = zod_1.z
    .object({
    title: (0, zod_2.nonEmptyString)('Title').optional(),
    status: zod_1.z.enum(PROJECT_STATUSES).optional(),
    progress: zod_2.progressSchema.optional(),
    githubLink: zod_2.urlSchema.optional().or(zod_1.z.literal('')),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
});
const projectMongooseSchema = new mongoose_1.default.Schema({
    jobId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Job',
        required: [true, 'Job ID is required'],
        unique: true,
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
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    status: {
        type: String,
        enum: {
            values: PROJECT_STATUSES,
            message: 'Status must be active, pending_review, completed, or cancelled',
        },
        default: 'active',
        index: true,
    },
    progress: {
        type: Number,
        default: 0,
        min: [0, 'Progress cannot be less than 0'],
        max: [100, 'Progress cannot exceed 100'],
    },
    githubLink: {
        type: String,
        trim: true,
    },
    deliveryNotes: {
        type: String,
        trim: true,
        maxlength: [2000, 'Delivery notes cannot exceed 2000 characters'],
    },
    reviewNotes: {
        type: String,
        trim: true,
        maxlength: [2000, 'Review notes cannot exceed 2000 characters'],
    },
    submittedAt: {
        type: Date,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
projectMongooseSchema.index({ clientId: 1, status: 1 });
projectMongooseSchema.index({ freelancerId: 1, status: 1 });
const Project = mongoose_1.default.model('Project', projectMongooseSchema);
exports.projectZodSchemas = {
    schema: projectZodSchema,
    create: createProjectZodSchema,
    update: updateProjectZodSchema,
};
exports.default = Project;
