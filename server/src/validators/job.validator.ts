const { z } = require('zod');
const { objectIdSchema } = require('../models/shared/zod');
const { jobZodSchemas, JOB_STATUSES } = require('../models/Job');

const jobIdSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

const { nonEmptyString, futureDateSchema } = require('../models/shared/zod');

const createJobBodySchema = z.object({
  title: nonEmptyString('Title').max(150, 'Title cannot exceed 150 characters'),
  description: nonEmptyString('Description').max(5000, 'Description cannot exceed 5000 characters'),
  category: nonEmptyString('Category'),
  budget: z.number().min(1, 'Budget must be at least 1 USD'),
  skills: z
    .array(z.string().trim().min(1, 'Skill cannot be empty'))
    .min(1, 'At least one skill is required'),
  deadline: futureDateSchema,
});

const createJobSchema = {
  body: createJobBodySchema,
};

const updateJobSchema = {
  params: jobIdSchema.params,
  body: jobZodSchemas.update,
};

const updateJobStatusSchema = {
  params: jobIdSchema.params,
  body: z.object({
    status: z.enum(JOB_STATUSES, {
      message: 'Status must be open, closed, or in_progress',
    }),
  }),
};

const listJobsSchema = {
  query: z.object({
    category: z.string().trim().optional(),
    status: z.enum(JOB_STATUSES).optional(),
    search: z.string().trim().optional(),
    clientId: objectIdSchema.optional(),
    budgetMin: z.coerce.number().int().min(1).optional(),
    budgetMax: z.coerce.number().int().min(1).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    sort: z.enum(['newest', 'oldest', 'budget_asc', 'budget_desc']).optional(),
    includeArchived: z
      .union([z.boolean(), z.enum(['true', 'false'])])
      .optional()
      .transform((value) => value === true || value === 'true'),
  }),
};

module.exports = {
  jobIdSchema,
  createJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
  listJobsSchema,
};
