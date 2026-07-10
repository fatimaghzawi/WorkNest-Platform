import mongoose from 'mongoose';
import { z } from 'zod';
import { objectIdSchema, futureDateSchema, nonEmptyString } from './shared/zod';

const JOB_STATUSES = ['open', 'closed', 'in_progress'];

const jobZodSchema = z.object({
  clientId: objectIdSchema,
  title: nonEmptyString('Title').max(150, 'Title cannot exceed 150 characters'),
  description: nonEmptyString('Description').max(
    5000,
    'Description cannot exceed 5000 characters'
  ),
  category: nonEmptyString('Category'),
  budget: z.number().min(1, 'Budget must be at least 1 USD'),
  skills: z
    .array(z.string().trim().min(1, 'Skill cannot be empty'))
    .min(1, 'At least one skill is required'),
  deadline: futureDateSchema,
  status: z.enum(JOB_STATUSES).optional().default('open'),
  deletedAt: z.coerce.date().optional().nullable(),
});

const createJobZodSchema = jobZodSchema;

const updateJobZodSchema = jobZodSchema
  .omit({ clientId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  })
  .refine((data) => !data.deadline || data.deadline > new Date(), {
    message: 'Deadline must be in the future',
    path: ['deadline'],
  });

const jobMongooseSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client ID is required'],
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
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    budget: {
      type: Number,
      required: [true, 'Budget is required'],
      min: [1, 'Budget must be at least 1 USD'],
    },
    skills: {
      type: [String],
      required: [true, 'Skills are required'],
      validate: {
        validator: (skills) => Array.isArray(skills) && skills.length > 0,
        message: 'At least one skill is required',
      },
      index: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    status: {
      type: String,
      enum: {
        values: JOB_STATUSES,
        message: 'Status must be open, closed, or in_progress',
      },
      default: 'open',
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

jobMongooseSchema.pre('validate', function validateFutureDeadline() {
  if (this.isNew && this.deadline && this.deadline <= new Date()) {
    this.invalidate('deadline', 'Deadline must be a future date');
  }
});

jobMongooseSchema.index({ clientId: 1, status: 1 });
jobMongooseSchema.index({ category: 1, status: 1 });

const Job = mongoose.model('Job', jobMongooseSchema);


export { JOB_STATUSES };

export const jobZodSchemas = {
  schema: jobZodSchema,
  create: createJobZodSchema,
  update: updateJobZodSchema,
}
export default Job;
