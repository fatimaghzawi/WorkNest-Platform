const { Router } = require('express');
const categoryController = require('./category.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const asyncHandler = require('../../common/utils/asyncHandler');
const {
  categoryIdSchema,
  createCategorySchema,
  updateCategorySchema,
  listCategoriesSchema,
} = require('./category.validation');

const router = Router();

router.get('/', validate(listCategoriesSchema), asyncHandler(categoryController.listCategories));
router.get('/:id', validate(categoryIdSchema), asyncHandler(categoryController.getCategory));

router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(createCategorySchema),
  asyncHandler(categoryController.createCategory)
);

router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(updateCategorySchema),
  asyncHandler(categoryController.updateCategory)
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(categoryIdSchema),
  asyncHandler(categoryController.deleteCategory)
);

module.exports = router;
