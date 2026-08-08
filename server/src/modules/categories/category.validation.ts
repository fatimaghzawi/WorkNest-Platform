const { z } = require('zod');
const { objectIdSchema } = require('../../common/validators/zod.shared');
const { categoryZodSchemas } = require('./category.model');

const categoryIdSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

const createCategorySchema = {
  body: categoryZodSchemas.create,
};

const updateCategorySchema = {
  params: categoryIdSchema.params,
  body: categoryZodSchemas.update,
};

const listCategoriesSchema = {
  query: z.object({
    isActive: z
      .enum(['true', 'false'])
      .optional()
      .transform((value) => (value === undefined ? undefined : value === 'true')),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
};

module.exports = {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
  listCategoriesSchema,
};
