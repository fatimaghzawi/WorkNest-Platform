const { Router } = require('express');
const userController = require('./user.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const asyncHandler = require('../../common/utils/asyncHandler');
const {
  userIdSchema,
  createUserSchema,
  updateUserSchema,
  listUsersSchema,
} = require('./user.validation');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', validate(listUsersSchema), asyncHandler(userController.listUsers));
router.get('/stats', asyncHandler(userController.getUserStats));
router.get('/:id', validate(userIdSchema), asyncHandler(userController.getUser));

router.post('/', validate(createUserSchema), asyncHandler(userController.createUser));

router.patch('/:id', validate(updateUserSchema), asyncHandler(userController.updateUser));

router.delete('/:id', validate(userIdSchema), asyncHandler(userController.deleteUser));

module.exports = router;
