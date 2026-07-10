import mongoose from 'mongoose';
import { z } from 'zod';
import { objectIdSchema, nonEmptyString, progressSchema, urlSchema } from './shared/zod';

const PROJECT_STATUSES = ['active', 'pending_review', 'completed', 'cancelled'];

const projectZodSchema = z.object({
  jobId: objectIdSchema,
  clientId: objectIdSchema,
  freelancerId: objectIdSchema,
  title: nonEmptyString('Title'),
  status: z.enum(PROJECT_STATUSES).optional().default('active'),
  progress: progressSchema.optional().default(0),
  githubLink: urlSchema.optional().or(z.literal('')),
  deliveryNotes: z.string().trim().max(2000).optional().or(z.literal('')),
  reviewNotes: z.string().trim().max(2000).optional().or(z.literal('')),
  submittedAt: z.coerce.date().optional().nullable(),
});

const createProjectZodSchema = projectZodSchema.omit({ status: true, progress: true });

const updateProjectZodSchema = z
  .object({
    title: nonEmptyString('Title').optional(),
    status: z.enum(PROJECT_STATUSES).optional(),
    progress: progressSchema.optional(),
    githubLink: urlSchema.optional().or(z.literal('')),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });

const projectMongooseSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
      unique: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client ID is required'],
      index: true,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

projectMongooseSchema.index({ clientId: 1, status: 1 });
projectMongooseSchema.index({ freelancerId: 1, status: 1 });

const Project = mongoose.model('Project', projectMongooseSchema);


export { PROJECT_STATUSES };

export const projectZodSchemas = {
  schema: projectZodSchema,
  create: createProjectZodSchema,
  update: updateProjectZodSchema,
}
export default Project;
