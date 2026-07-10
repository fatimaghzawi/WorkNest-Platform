const { z } = require('zod');
const { objectIdSchema } = require('../models/shared/zod');

const projectIdSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

const submitProjectSchema = {
  ...projectIdSchema,
  body: z.object({
    deliveryNotes: z.string().trim().max(2000).optional(),
  }),
};

const requestReviewSchema = {
  ...projectIdSchema,
  body: z.object({
    reviewNotes: z
      .string()
      .trim()
      .min(10, 'Please describe what needs to be revised')
      .max(2000),
  }),
};

const cancelProjectSchema = {
  ...projectIdSchema,
  body: z.object({
    reason: z.string().trim().max(500).optional(),
  }),
};

module.exports = {
  projectIdSchema,
  submitProjectSchema,
  requestReviewSchema,
  cancelProjectSchema,
};
