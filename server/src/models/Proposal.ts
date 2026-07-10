import mongoose from 'mongoose';
import { z } from 'zod';
import { objectIdSchema, nonEmptyString } from './shared/zod';

const PROPOSAL_STATUSES = ['pending', 'accepted', 'rejected'];

const proposalZodSchema = z.object({
  jobId: objectIdSchema,
  freelancerId: objectIdSchema,
  coverLetter: nonEmptyString('Cover letter').max(
    3000,
    'Cover letter cannot exceed 3000 characters'
  ),
  price: z.number().min(1, 'Price must be at least 1'),
  timeline: nonEmptyString('Timeline'),
  status: z.enum(PROPOSAL_STATUSES).optional().default('pending'),
});

const createProposalZodSchema = proposalZodSchema.omit({ status: true });

const updateProposalZodSchema = z
  .object({
    coverLetter: nonEmptyString('Cover letter')
      .max(3000, 'Cover letter cannot exceed 3000 characters')
      .optional(),
    price: z.number().min(1, 'Price must be at least 1').optional(),
    timeline: nonEmptyString('Timeline').optional(),
    status: z.enum(PROPOSAL_STATUSES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });

const proposalMongooseSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
      index: true,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

proposalMongooseSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });

const Proposal = mongoose.model('Proposal', proposalMongooseSchema);


export { PROPOSAL_STATUSES };

export const proposalZodSchemas = {
  schema: proposalZodSchema,
  create: createProposalZodSchema,
  update: updateProposalZodSchema,
}
export default Proposal;
