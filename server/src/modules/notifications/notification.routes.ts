const { Router } = require('express');
const notificationController = require('./notification.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const asyncHandler = require('../../common/utils/asyncHandler');
const {
  listNotificationsSchema,
  notificationIdSchema,
} = require('./notification.validation');

const router = Router();

router.use(authenticate, authorize('client', 'freelancer'));

router.get('/unread-count', asyncHandler(notificationController.getUnreadCount));
router.patch('/read-all', asyncHandler(notificationController.markAllNotificationsRead));
router.get(
  '/',
  validate(listNotificationsSchema),
  asyncHandler(notificationController.listNotifications)
);
router.patch(
  '/:id/read',
  validate(notificationIdSchema),
  asyncHandler(notificationController.markNotificationRead)
);

module.exports = router;
