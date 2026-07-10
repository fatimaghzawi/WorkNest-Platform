import mongoose from 'mongoose';
import { z } from 'zod';
import { objectIdSchema, nonEmptyString, progressSchema } from './shared/zod';

const MILESTONE_STATUSES = ['pending', 'in_progress', 'completed'];

const milestoneZodSchema = z.object({
  projectId: objectIdSchema,
  title: nonEmptyString('Title').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().trim().optional(),
  dueDate: z.coerce.date(),
  status: z.enum(MILESTONE_STATUSES).optional().default('pending'),
  progress: progressSchema.optional().default(0),
  completedAt: z.coerce.date().optional(),
});

const createMilestoneZodSchema = milestoneZodSchema.omit({
  status: true,
  progress: true,
  completedAt: true,
});

const updateMilestoneZodSchema = z
  .object({
    title: nonEmptyString('Title').max(150).optional(),
    description: z.string().trim().optional(),
    dueDate: z.coerce.date().optional(),
    status: z.enum(MILESTONE_STATUSES).optional(),
    progress: progressSchema.optional(),
    completedAt: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });

const milestoneMongooseSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: false,
  }
);

milestoneMongooseSchema.pre('save', function setCompletedAt() {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }

  if (this.isModified('status') && this.status !== 'completed') {
    this.completedAt = undefined;
  }

});

milestoneMongooseSchema.index({ projectId: 1, status: 1 });

const Milestone = mongoose.model('Milestone', milestoneMongooseSchema);


export { MILESTONE_STATUSES };

export const milestoneZodSchemas = {
  schema: milestoneZodSchema,
  create: createMilestoneZodSchema,
  update: updateMilestoneZodSchema,
}
export default Milestone;
