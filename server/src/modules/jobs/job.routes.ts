const { Router } = require('express');
const jobController = require('./job.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { optionalAuthenticate } = require('../../common/middleware/optionalAuth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const asyncHandler = require('../../common/utils/asyncHandler');
const {
  jobIdSchema,
  createJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
  listJobsSchema,
} = require('./job.validation');

const router = Router();

router.get(
  '/',
  optionalAuthenticate,
  validate(listJobsSchema),
  asyncHandler(jobController.listJobs)
);

router.get(
  '/my',
  authenticate,
  authorize('client'),
  validate(listJobsSchema),
  asyncHandler(jobController.getMyJobs)
);

router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  asyncHandler(jobController.getJobStats)
);

router.get(
  '/:id',
  optionalAuthenticate,
  validate(jobIdSchema),
  asyncHandler(jobController.getJob)
);

router.post(
  '/',
  authenticate,
  authorize('client'),
  validate(createJobSchema),
  asyncHandler(jobController.createJob)
);

router.patch(
  '/:id',
  authenticate,
  authorize('client', 'admin'),
  validate(updateJobSchema),
  asyncHandler(jobController.updateJob)
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validate(updateJobStatusSchema),
  asyncHandler(jobController.updateJobStatus)
);

router.delete(
  '/:id',
  authenticate,
  authorize('client', 'admin'),
  validate(jobIdSchema),
  asyncHandler(jobController.deleteJob)
);

module.exports = router;
