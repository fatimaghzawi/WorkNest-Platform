const { z } = require('zod');

const paginationQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const chartQuerySchema = {
  query: z.object({
    months: z.coerce.number().int().min(1).max(36).optional(),
  }),
};

const latestCustomersSchema = {
  query: z.object({
    limit: z.coerce.number().int().positive().max(50).optional(),
  }),
};

const recentJobsSchema = {
  query: paginationQuery,
};

const statisticsQuerySchema = {
  query: z.object({
    months: z.coerce.number().int().min(1).max(36).optional(),
  }),
};

module.exports = {
  chartQuerySchema,
  latestCustomersSchema,
  recentJobsSchema,
  statisticsQuerySchema,
};
