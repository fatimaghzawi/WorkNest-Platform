"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentZodSchemas = exports.PAYMENT_STATUSES = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const zod_2 = require("./shared/zod");
const PAYMENT_STATUSES = ['pending', 'held', 'released', 'refunded'];
exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
const paymentZodSchema = zod_1.z.object({
    projectId: zod_2.objectIdSchema,
    jobId: zod_2.objectIdSchema,
    proposalId: zod_2.objectIdSchema,
    clientId: zod_2.objectIdSchema,
    freelancerId: zod_2.objectIdSchema,
    amount: zod_1.z.number().min(1, 'Amount must be at least 1'),
    currency: zod_1.z.string().trim().min(3).max(3).optional().default('USD'),
    status: zod_1.z.enum(PAYMENT_STATUSES).optional().default('pending'),
    cardBrand: zod_1.z.string().trim().max(20).optional(),
    cardLast4: zod_1.z.string().trim().length(4).optional(),
    cardholderName: zod_1.z.string().trim().max(120).optional(),
    stripeCheckoutSessionId: zod_1.z.string().trim().max(255).optional(),
    stripePaymentIntentId: zod_1.z.string().trim().max(255).optional(),
    paymentDate: zod_1.z.coerce.date().optional(),
    depositedAt: zod_1.z.coerce.date().optional().nullable(),
    releasedAt: zod_1.z.coerce.date().optional().nullable(),
    refundedAt: zod_1.z.coerce.date().optional().nullable(),
    platformFee: zod_1.z.number().min(0).optional(),
    freelancerPayout: zod_1.z.number().min(0).optional(),
    feeRate: zod_1.z.number().min(0).max(1).optional(),
    budgetRangeLabel: zod_1.z.string().trim().max(40).optional(),
});
const createPaymentZodSchema = paymentZodSchema.omit({
    status: true,
    paymentDate: true,
    depositedAt: true,
    releasedAt: true,
});
const paymentMongooseSchema = new mongoose_1.default.Schema({
    projectId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project ID is required'],
        unique: true,
        index: true,
    },
    jobId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
        index: true,
    },
    proposalId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Proposal',
        required: true,
    },
    clientId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    freelancerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [1, 'Amount must be at least 1'],
    },
    currency: {
        type: String,
        default: 'USD',
        trim: true,
        uppercase: true,
    },
    status: {
        type: String,
        enum: {
            values: PAYMENT_STATUSES,
            message: 'Status must be pending, held, released, or refunded',
        },
        default: 'pending',
        index: true,
    },
    cardBrand: {
        type: String,
        trim: true,
    },
    cardLast4: {
        type: String,
        trim: true,
        minlength: 4,
        maxlength: 4,
    },
    cardholderName: {
        type: String,
        trim: true,
    },
    stripeCheckoutSessionId: {
        type: String,
        trim: true,
        index: true,
    },
    stripePaymentIntentId: {
        type: String,
        trim: true,
        index: true,
    },
    paymentDate: {
        type: Date,
    },
    depositedAt: {
        type: Date,
    },
    releasedAt: {
        type: Date,
    },
    refundedAt: {
        type: Date,
    },
    platformFee: {
        type: Number,
        min: [0, 'Platform fee cannot be negative'],
    },
    freelancerPayout: {
        type: Number,
        min: [0, 'Freelancer payout cannot be negative'],
    },
    feeRate: {
        type: Number,
        min: [0, 'Fee rate cannot be negative'],
        max: [1, 'Fee rate cannot exceed 100%'],
    },
    budgetRangeLabel: {
        type: String,
        trim: true,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
paymentMongooseSchema.index({ clientId: 1, status: 1, createdAt: -1 });
paymentMongooseSchema.index({ freelancerId: 1, status: 1, createdAt: -1 });
const Payment = mongoose_1.default.model('Payment', paymentMongooseSchema);
exports.paymentZodSchemas = {
    schema: paymentZodSchema,
    create: createPaymentZodSchema,
};
exports.default = Payment;
