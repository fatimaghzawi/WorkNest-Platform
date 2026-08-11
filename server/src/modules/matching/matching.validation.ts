const { z } = require('zod');
const { objectIdSchema } = require('../../common/validators/zod.shared');

const listSuggestionsSchema = {
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  }),
};

const jobSuggestionsSchema = {
  params: z.object({
    jobId: objectIdSchema,
  }),
  query: listSuggestionsSchema.query,
};

module.exports = {
  listSuggestionsSchema,
  jobSuggestionsSchema,
};
