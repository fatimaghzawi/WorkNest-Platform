import mongoose from 'mongoose';
import { z } from 'zod';
import { objectIdSchema, objectIdArraySchema, nonEmptyString } from './shared/zod';

const DELIVERABLE_STATUSES = ['submitted', 'approved', 'revision_requested'];

const deliverableZodSchema = z.object({
  projectId: objectIdSchema,
  submittedBy: objectIdSchema,
  title: nonEmptyString('Title'),
  notes: z.string().trim().max(2000, 'Notes cannot exceed 2000 characters').optional(),
  linkedFileIds: objectIdArraySchema.optional().default([]),
  status: z.enum(DELIVERABLE_STATUSES).optional().default('submitted'),
  reviewedAt: z.coerce.date().optional(),
  approvedAt: z.coerce.date().optional(),
});

const createDeliverableZodSchema = deliverableZodSchema.omit({
  status: true,
  reviewedAt: true,
  approvedAt: true,
});

const updateDeliverableZodSchema = z
  .object({
    title: nonEmptyString('Title').optional(),
    notes: z.string().trim().max(2000).optional(),
    linkedFileIds: objectIdArraySchema.optional(),
    status: z.enum(DELIVERABLE_STATUSES).optional(),
    reviewedAt: z.coerce.date().optional(),
    approvedAt: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });

const deliverableMongooseSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
      index: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
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
      type: [mongoose.Schema.Types.ObjectId],
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

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

const Deliverable = mongoose.model('Deliverable', deliverableMongooseSchema);


export { DELIVERABLE_STATUSES };

export const deliverableZodSchemas = {
  schema: deliverableZodSchema,
  create: createDeliverableZodSchema,
  update: updateDeliverableZodSchema,
}
export default Deliverable;
