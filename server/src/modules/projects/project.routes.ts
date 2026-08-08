const { Router } = require('express');
const projectController = require('./project.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const asyncHandler = require('../../common/utils/asyncHandler');
const { z } = require('zod');
const { objectIdSchema } = require('../../common/validators/zod.shared');
const { PROJECT_STATUSES } = require('./project.model');
const {
  projectIdSchema,
  submitProjectSchema,
  requestReviewSchema,
  cancelProjectSchema,
} = require('./project.validation');

const router = Router();

const listSchema = {
  query: z.object({
    status: z.enum(PROJECT_STATUSES).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
};

const idSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  asyncHandler(projectController.getProjectStats)
);

router.get(
  '/',
  authenticate,
  authorize('admin', 'client', 'freelancer'),
  validate(listSchema),
  asyncHandler(projectController.listProjects)
);

router.get(
  '/:id',
  authenticate,
  authorize('admin', 'client', 'freelancer'),
  validate(idSchema),
  asyncHandler(projectController.getProject)
);

router.patch(
  '/:id/submit',
  authenticate,
  authorize('freelancer', 'admin'),
  validate(submitProjectSchema),
  asyncHandler(projectController.submitForReview)
);

router.patch(
  '/:id/accept',
  authenticate,
  authorize('client', 'admin'),
  validate(projectIdSchema),
  asyncHandler(projectController.acceptProject)
);

router.patch(
  '/:id/request-review',
  authenticate,
  authorize('client', 'admin'),
  validate(requestReviewSchema),
  asyncHandler(projectController.requestRevision)
);

router.patch(
  '/:id/cancel',
  authenticate,
  authorize('client', 'admin'),
  validate(cancelProjectSchema),
  asyncHandler(projectController.cancelProject)
);

module.exports = router;
