const categoryRoutes = require('./category.routes');
const categoryController = require('./category.controller');
const categoryService = require('./category.service');
const categoryRepository = require('./category.repository');
const Category = require('./category.model').default;
const { slugify } = require('./category.model');

module.exports = {
  categoryRoutes,
  categoryController,
  categoryService,
  categoryRepository,
  Category,
  slugify,
};
