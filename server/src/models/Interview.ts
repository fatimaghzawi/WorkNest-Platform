import mongoose from 'mongoose';
import { z } from 'zod';
import { objectIdSchema, nonEmptyString, urlSchema } from './shared/zod';

const INTERVIEW_STATUSES = ['scheduled', 'confirmed', 'completed', 'cancelled', 'declined'] as const;

const interviewZodSchema = z.object({
  jobId: objectIdSchema,
  proposalId: objectIdSchema,
  clientId: objectIdSchema,
  freelancerId: objectIdSchema,
  scheduledDate: z.coerce.date(),
  duration: z.number().int().positive('Duration must be at least 1 minute'),
  meetingLink: urlSchema,
  meetingPassword: z.string().trim().optional().or(z.literal('')),
  notes: z.string().trim().max(2000, 'Notes cannot exceed 2000 characters').optional().or(z.literal('')),
  status: z.enum(INTERVIEW_STATUSES).optional().default('scheduled'),
});

const createInterviewZodSchema = interviewZodSchema.omit({
  status: true,
  clientId: true,
});

const updateInterviewZodSchema = z
  .object({
    scheduledDate: z.coerce.date().optional(),
    duration: z.number().int().positive('Duration must be at least 1 minute').optional(),
    meetingLink: urlSchema.optional(),
    meetingPassword: z.string().trim().optional().or(z.literal('')),
    notes: z.string().trim().max(2000).optional().or(z.literal('')),
    status: z.enum(INTERVIEW_STATUSES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });

const interviewMongooseSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
      index: true,
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      required: [true, 'Proposal ID is required'],
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
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    meetingLink: {
      type: String,
      required: [true, 'Meeting link is required'],
      trim: true,
    },
    meetingPassword: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: INTERVIEW_STATUSES,
        message: 'Status must be scheduled, confirmed, completed, cancelled, or declined',
      },
      default: 'scheduled',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

interviewMongooseSchema.index({ clientId: 1, status: 1 });
interviewMongooseSchema.index({ freelancerId: 1, status: 1 });
interviewMongooseSchema.index({ scheduledDate: 1 });

const Interview = mongoose.model('Interview', interviewMongooseSchema);

export { INTERVIEW_STATUSES };

export const interviewZodSchemas = {
  schema: interviewZodSchema,
  create: createInterviewZodSchema,
  update: updateInterviewZodSchema,
};

export default Interview;
