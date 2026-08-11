const { Router } = require('express');
const matchingController = require('./matching.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const asyncHandler = require('../../common/utils/asyncHandler');
const { listSuggestionsSchema, jobSuggestionsSchema } = require('./matching.validation');

const router = Router();

/** Suggestions only — no write side effects on jobs/proposals/projects. */
router.get(
  '/jobs',
  authenticate,
  authorize('freelancer'),
  validate(listSuggestionsSchema),
  asyncHandler(matchingController.suggestJobs)
);

router.get(
  '/jobs/:jobId/freelancers',
  authenticate,
  authorize('client'),
  validate(jobSuggestionsSchema),
  asyncHandler(matchingController.suggestFreelancers)
);

module.exports = router;
