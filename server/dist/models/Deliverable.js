"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliverableZodSchemas = exports.DELIVERABLE_STATUSES = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const zod_2 = require("./shared/zod");
const DELIVERABLE_STATUSES = ['submitted', 'approved', 'revision_requested'];
exports.DELIVERABLE_STATUSES = DELIVERABLE_STATUSES;
const deliverableZodSchema = zod_1.z.object({
    projectId: zod_2.objectIdSchema,
    submittedBy: zod_2.objectIdSchema,
    title: (0, zod_2.nonEmptyString)('Title'),
    notes: zod_1.z.string().trim().max(2000, 'Notes cannot exceed 2000 characters').optional(),
    linkedFileIds: zod_2.objectIdArraySchema.optional().default([]),
    status: zod_1.z.enum(DELIVERABLE_STATUSES).optional().default('submitted'),
    reviewedAt: zod_1.z.coerce.date().optional(),
    approvedAt: zod_1.z.coerce.date().optional(),
});
const createDeliverableZodSchema = deliverableZodSchema.omit({
    status: true,
    reviewedAt: true,
    approvedAt: true,
});
const updateDeliverableZodSchema = zod_1.z
    .object({
    title: (0, zod_2.nonEmptyString)('Title').optional(),
    notes: zod_1.z.string().trim().max(2000).optional(),
    linkedFileIds: zod_2.objectIdArraySchema.optional(),
    status: zod_1.z.enum(DELIVERABLE_STATUSES).optional(),
    reviewedAt: zod_1.z.coerce.date().optional(),
    approvedAt: zod_1.z.coerce.date().optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
});
const deliverableMongooseSchema = new mongoose_1.default.Schema({
    projectId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project ID is required'],
        index: true,
    },
    submittedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Submitter ID is required'],
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    linkedFileIds: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        default: [],
    },
    status: {
        type: String,
        enum: {
            values: DELIVERABLE_STATUSES,
            message: 'Status must be submitted, approved, or revision_requested',
        },
        default: 'submitted',
        index: true,
    },
    reviewedAt: {
        type: Date,
    },
    approvedAt: {
        type: Date,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
deliverableMongooseSchema.pre('save', function setReviewTimestamps() {
    if (this.isModified('status')) {
        if (['approved', 'revision_requested'].includes(this.status) && !this.reviewedAt) {
            this.reviewedAt = new Date();
        }
        if (this.status === 'approved' && !this.approvedAt) {
            this.approvedAt = new Date();
        }
        if (this.status !== 'approved') {
            this.approvedAt = undefined;
        }
    }
});
deliverableMongooseSchema.index({ projectId: 1, status: 1 });
const Deliverable = mongoose_1.default.model('Deliverable', deliverableMongooseSchema);
exports.deliverableZodSchemas = {
    schema: deliverableZodSchema,
    create: createDeliverableZodSchema,
    update: updateDeliverableZodSchema,
};
exports.default = Deliverable;
