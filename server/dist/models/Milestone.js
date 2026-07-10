"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.milestoneZodSchemas = exports.MILESTONE_STATUSES = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const zod_2 = require("./shared/zod");
const MILESTONE_STATUSES = ['pending', 'in_progress', 'completed'];
exports.MILESTONE_STATUSES = MILESTONE_STATUSES;
const milestoneZodSchema = zod_1.z.object({
    projectId: zod_2.objectIdSchema,
    title: (0, zod_2.nonEmptyString)('Title').max(150, 'Title cannot exceed 150 characters'),
    description: zod_1.z.string().trim().optional(),
    dueDate: zod_1.z.coerce.date(),
    status: zod_1.z.enum(MILESTONE_STATUSES).optional().default('pending'),
    progress: zod_2.progressSchema.optional().default(0),
    completedAt: zod_1.z.coerce.date().optional(),
});
const createMilestoneZodSchema = milestoneZodSchema.omit({
    status: true,
    progress: true,
    completedAt: true,
});
const updateMilestoneZodSchema = zod_1.z
    .object({
    title: (0, zod_2.nonEmptyString)('Title').max(150).optional(),
    description: zod_1.z.string().trim().optional(),
    dueDate: zod_1.z.coerce.date().optional(),
    status: zod_1.z.enum(MILESTONE_STATUSES).optional(),
    progress: zod_2.progressSchema.optional(),
    completedAt: zod_1.z.coerce.date().optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
});
const milestoneMongooseSchema = new mongoose_1.default.Schema({
    projectId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project ID is required'],
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
        trim: true,
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required'],
    },
    status: {
        type: String,
        enum: {
            values: MILESTONE_STATUSES,
            message: 'Status must be pending, in_progress, or completed',
        },
        default: 'pending',
        index: true,
    },
    progress: {
        type: Number,
        default: 0,
        min: [0, 'Progress cannot be less than 0'],
        max: [100, 'Progress cannot exceed 100'],
    },
    completedAt: {
        type: Date,
    },
}, {
    timestamps: false,
});
milestoneMongooseSchema.pre('save', function setCompletedAt() {
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }
    if (this.isModified('status') && this.status !== 'completed') {
        this.completedAt = undefined;
    }
});
milestoneMongooseSchema.index({ projectId: 1, status: 1 });
const Milestone = mongoose_1.default.model('Milestone', milestoneMongooseSchema);
exports.milestoneZodSchemas = {
    schema: milestoneZodSchema,
    create: createMilestoneZodSchema,
    update: updateMilestoneZodSchema,
};
exports.default = Milestone;
