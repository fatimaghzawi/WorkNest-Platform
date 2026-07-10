"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proposalZodSchemas = exports.PROPOSAL_STATUSES = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const zod_2 = require("./shared/zod");
const PROPOSAL_STATUSES = ['pending', 'accepted', 'rejected'];
exports.PROPOSAL_STATUSES = PROPOSAL_STATUSES;
const proposalZodSchema = zod_1.z.object({
    jobId: zod_2.objectIdSchema,
    freelancerId: zod_2.objectIdSchema,
    coverLetter: (0, zod_2.nonEmptyString)('Cover letter').max(3000, 'Cover letter cannot exceed 3000 characters'),
    price: zod_1.z.number().min(1, 'Price must be at least 1'),
    timeline: (0, zod_2.nonEmptyString)('Timeline'),
    status: zod_1.z.enum(PROPOSAL_STATUSES).optional().default('pending'),
});
const createProposalZodSchema = proposalZodSchema.omit({ status: true });
const updateProposalZodSchema = zod_1.z
    .object({
    coverLetter: (0, zod_2.nonEmptyString)('Cover letter')
        .max(3000, 'Cover letter cannot exceed 3000 characters')
        .optional(),
    price: zod_1.z.number().min(1, 'Price must be at least 1').optional(),
    timeline: (0, zod_2.nonEmptyString)('Timeline').optional(),
    status: zod_1.z.enum(PROPOSAL_STATUSES).optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
});
const proposalMongooseSchema = new mongoose_1.default.Schema({
    jobId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Job',
        required: [true, 'Job ID is required'],
        index: true,
    },
    freelancerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Freelancer ID is required'],
        index: true,
    },
    coverLetter: {
        type: String,
        required: [true, 'Cover letter is required'],
        trim: true,
        maxlength: [3000, 'Cover letter cannot exceed 3000 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [1, 'Price must be at least 1'],
    },
    timeline: {
        type: String,
        required: [true, 'Timeline is required'],
        trim: true,
    },
    status: {
        type: String,
        enum: {
            values: PROPOSAL_STATUSES,
            message: 'Status must be pending, accepted, or rejected',
        },
        default: 'pending',
        index: true,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
proposalMongooseSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });
const Proposal = mongoose_1.default.model('Proposal', proposalMongooseSchema);
exports.proposalZodSchemas = {
    schema: proposalZodSchema,
    create: createProposalZodSchema,
    update: updateProposalZodSchema,
};
exports.default = Proposal;
