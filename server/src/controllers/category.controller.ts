const categoryService = require('../services/category.service');
const { sendSuccess } = require('../utils/response');

const listCategories = async (req, res) => {
  const result = await categoryService.listCategories(req.query);
  return sendSuccess(res, {
    message: 'Categories retrieved successfully',
    data: result.categories,
    meta: result.meta,
  });
};

const getCategory = async (req, res) => {
  const category = await categoryService.getCategoryById(req.params.id);
  return sendSuccess(res, {
    message: 'Category retrieved successfully',
    data: category,
  });
};

const createCategory = async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Category created successfully',
    data: category,
  });
};

const updateCategory = async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  return sendSuccess(res, {
    message: 'Category updated successfully',
    data: category,
  });
};

const deleteCategory = async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  return sendSuccess(res, {
    message: 'Category deactivated successfully',
  });
};

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
