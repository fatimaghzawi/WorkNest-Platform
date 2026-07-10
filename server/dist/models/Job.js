"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobZodSchemas = exports.JOB_STATUSES = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const zod_2 = require("./shared/zod");
const JOB_STATUSES = ['open', 'closed', 'in_progress'];
exports.JOB_STATUSES = JOB_STATUSES;
const jobZodSchema = zod_1.z.object({
    clientId: zod_2.objectIdSchema,
    title: (0, zod_2.nonEmptyString)('Title').max(150, 'Title cannot exceed 150 characters'),
    description: (0, zod_2.nonEmptyString)('Description').max(5000, 'Description cannot exceed 5000 characters'),
    category: (0, zod_2.nonEmptyString)('Category'),
    budget: zod_1.z.number().min(1, 'Budget must be at least 1 USD'),
    skills: zod_1.z
        .array(zod_1.z.string().trim().min(1, 'Skill cannot be empty'))
        .min(1, 'At least one skill is required'),
    deadline: zod_2.futureDateSchema,
    status: zod_1.z.enum(JOB_STATUSES).optional().default('open'),
    deletedAt: zod_1.z.coerce.date().optional().nullable(),
});
const createJobZodSchema = jobZodSchema;
const updateJobZodSchema = jobZodSchema
    .omit({ clientId: true })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
})
    .refine((data) => !data.deadline || data.deadline > new Date(), {
    message: 'Deadline must be in the future',
    path: ['deadline'],
});
const jobMongooseSchema = new mongoose_1.default.Schema({
    clientId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Client ID is required'],
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        index: true,
    },
    budget: {
        type: Number,
        required: [true, 'Budget is required'],
        min: [1, 'Budget must be at least 1 USD'],
    },
    skills: {
        type: [String],
        required: [true, 'Skills are required'],
        validate: {
            validator: (skills) => Array.isArray(skills) && skills.length > 0,
            message: 'At least one skill is required',
        },
        index: true,
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required'],
    },
    status: {
        type: String,
        enum: {
            values: JOB_STATUSES,
            message: 'Status must be open, closed, or in_progress',
        },
        default: 'open',
        index: true,
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
jobMongooseSchema.pre('validate', function validateFutureDeadline() {
    if (this.isNew && this.deadline && this.deadline <= new Date()) {
        this.invalidate('deadline', 'Deadline must be a future date');
    }
});
jobMongooseSchema.index({ clientId: 1, status: 1 });
jobMongooseSchema.index({ category: 1, status: 1 });
const Job = mongoose_1.default.model('Job', jobMongooseSchema);
exports.jobZodSchemas = {
    schema: jobZodSchema,
    create: createJobZodSchema,
    update: updateJobZodSchema,
};
exports.default = Job;
