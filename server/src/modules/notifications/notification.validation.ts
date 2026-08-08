const { z } = require('zod');
const { objectIdSchema } = require('../../common/validators/zod.shared');

const listNotificationsSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    unreadOnly: z.enum(['true', 'false']).optional(),
  }),
};

const notificationIdSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

module.exports = {
  listNotificationsSchema,
  notificationIdSchema,
};
