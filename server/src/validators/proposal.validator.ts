const { z } = require('zod');
const { objectIdSchema, nonEmptyString } = require('../models/shared/zod');
const { proposalZodSchemas } = require('../models/Proposal');

const proposalIdSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

const jobIdParamSchema = {
  params: z.object({
    jobId: objectIdSchema,
  }),
};

const updateProposalBodySchema = z
  .object({
    coverLetter: nonEmptyString('Cover letter')
      .max(3000, 'Cover letter cannot exceed 3000 characters')
      .optional(),
    price: z.number().min(1, 'Price must be at least 1').optional(),
    timeline: nonEmptyString('Timeline').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required for update',
  });

const createProposalSchema = {
  body: proposalZodSchemas.create.omit({ freelancerId: true }),
};

const updateProposalSchema = {
  params: proposalIdSchema.params,
  body: updateProposalBodySchema,
};

const updateProposalStatusSchema = {
  params: proposalIdSchema.params,
  body: z.object({
    status: z.enum(['accepted', 'rejected'], {
      message: 'Status must be accepted or rejected',
    }),
  }),
};

const listProposalsSchema = {
  query: z.object({
    status: z.enum(['pending', 'accepted', 'rejected']).optional(),
    jobId: objectIdSchema.optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
};

module.exports = {
  proposalIdSchema,
  jobIdParamSchema,
  createProposalSchema,
  updateProposalSchema,
  updateProposalStatusSchema,
  listProposalsSchema,
};
