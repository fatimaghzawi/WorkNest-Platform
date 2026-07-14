import mongoose from 'mongoose';
import { z } from 'zod';
import { objectIdSchema, nonEmptyString } from './shared/zod';

const TASK_STATUSES = ['todo', 'in_progress', 'review', 'done'] as const;
const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
const TASK_ORIGINS = ['client', 'freelancer'] as const;

const taskZodSchema = z.object({
  jobId: objectIdSchema,
  title: nonEmptyString('Title').max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(TASK_STATUSES).optional().default('todo'),
  priority: z.enum(TASK_PRIORITIES).optional().default('medium'),
  origin: z.enum(TASK_ORIGINS).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  createdBy: objectIdSchema.optional(),
  submissionNotes: z.string().trim().max(2000).optional().or(z.literal('')),
  submittedAt: z.coerce.date().optional().nullable(),
});

const createTaskZodSchema = taskZodSchema.omit({ createdBy: true });

const updateTaskZodSchema = z
  .object({
    title: nonEmptyString('Title').max(200).optional(),
    description: z.string().trim().max(2000).optional().or(z.literal('')),
    status: z.enum(TASK_STATUSES).optional(),
    priority: z.enum(TASK_PRIORITIES).optional(),
    dueDate: z.coerce.date().nullable().optional(),
    submissionNotes: z.string().trim().max(2000).optional().or(z.literal('')),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });

const taskMongooseSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: 'Status must be todo, in_progress, review, or done',
      },
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITIES,
        message: 'Priority must be low, medium, or high',
      },
      default: 'medium',
      index: true,
    },
    origin: {
      type: String,
      enum: {
        values: TASK_ORIGINS,
        message: 'Origin must be client or freelancer',
      },
      index: true,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    submissionNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Submission notes cannot exceed 2000 characters'],
    },
    submittedAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  {
    timestamps: true,
  }
);

taskMongooseSchema.index({ jobId: 1, status: 1 });
taskMongooseSchema.index({ jobId: 1, createdAt: -1 });
taskMongooseSchema.index({ jobId: 1, origin: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskMongooseSchema);

export { TASK_STATUSES, TASK_PRIORITIES, TASK_ORIGINS };

export const taskZodSchemas = {
  schema: taskZodSchema,
  create: createTaskZodSchema,
  update: updateTaskZodSchema,
};

export default Task;
