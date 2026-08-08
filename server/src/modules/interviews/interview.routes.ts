const { Router } = require('express');
const interviewController = require('./interview.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const asyncHandler = require('../../common/utils/asyncHandler');
const {
  interviewIdSchema,
  createInterviewSchema,
  updateInterviewSchema,
  listInterviewsSchema,
} = require('./interview.validation');

const router = Router();

router.get(
  '/',
  authenticate,
  authorize('client', 'freelancer', 'admin'),
  validate(listInterviewsSchema),
  asyncHandler(interviewController.listMyInterviews)
);

router.post(
  '/',
  authenticate,
  authorize('client', 'admin'),
  validate(createInterviewSchema),
  asyncHandler(interviewController.createInterview)
);

router.get(
  '/:id',
  authenticate,
  authorize('client', 'freelancer', 'admin'),
  validate(interviewIdSchema),
  asyncHandler(interviewController.getInterview)
);

router.patch(
  '/:id',
  authenticate,
  authorize('client', 'admin'),
  validate(updateInterviewSchema),
  asyncHandler(interviewController.updateInterview)
);

router.patch(
  '/:id/cancel',
  authenticate,
  authorize('client', 'admin'),
  validate(interviewIdSchema),
  asyncHandler(interviewController.cancelInterview)
);

router.patch(
  '/:id/complete',
  authenticate,
  authorize('client', 'admin', 'freelancer'),
  validate(interviewIdSchema),
  asyncHandler(interviewController.completeInterview)
);

router.patch(
  '/:id/confirm',
  authenticate,
  authorize('freelancer', 'admin'),
  validate(interviewIdSchema),
  asyncHandler(interviewController.confirmInterview)
);

router.patch(
  '/:id/decline',
  authenticate,
  authorize('freelancer', 'admin'),
  validate(interviewIdSchema),
  asyncHandler(interviewController.declineInterview)
);

module.exports = router;
