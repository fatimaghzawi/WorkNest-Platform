import mongoose from 'mongoose';
import { z } from 'zod';
import { objectIdSchema } from './shared/zod';

const PAYMENT_STATUSES = ['pending', 'held', 'released', 'refunded'];

const paymentZodSchema = z.object({
  projectId: objectIdSchema,
  jobId: objectIdSchema,
  proposalId: objectIdSchema,
  clientId: objectIdSchema,
  freelancerId: objectIdSchema,
  amount: z.number().min(1, 'Amount must be at least 1'),
  currency: z.string().trim().min(3).max(3).optional().default('USD'),
  status: z.enum(PAYMENT_STATUSES).optional().default('pending'),
  cardBrand: z.string().trim().max(20).optional(),
  cardLast4: z.string().trim().length(4).optional(),
  cardholderName: z.string().trim().max(120).optional(),
  stripeCheckoutSessionId: z.string().trim().max(255).optional(),
  stripePaymentIntentId: z.string().trim().max(255).optional(),
  paymentDate: z.coerce.date().optional(),
  depositedAt: z.coerce.date().optional().nullable(),
  releasedAt: z.coerce.date().optional().nullable(),
  refundedAt: z.coerce.date().optional().nullable(),
  platformFee: z.number().min(0).optional(),
  freelancerPayout: z.number().min(0).optional(),
  feeRate: z.number().min(0).max(1).optional(),
  budgetRangeLabel: z.string().trim().max(40).optional(),
});

const createPaymentZodSchema = paymentZodSchema.omit({
  status: true,
  paymentDate: true,
  depositedAt: true,
  releasedAt: true,
});

const paymentMongooseSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      unique: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

paymentMongooseSchema.index({ clientId: 1, status: 1, createdAt: -1 });
paymentMongooseSchema.index({ freelancerId: 1, status: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentMongooseSchema);

export { PAYMENT_STATUSES };

export const paymentZodSchemas = {
  schema: paymentZodSchema,
  create: createPaymentZodSchema,
};

export default Payment;
