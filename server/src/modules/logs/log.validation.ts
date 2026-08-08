const { z } = require('zod');

const listLogsSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    level: z.enum(['all', 'info', 'warning', 'error']).optional(),
    source: z.string().trim().max(120).optional(),
    search: z.string().trim().max(100).optional(),
  }),
};

module.exports = {
  listLogsSchema,
};
