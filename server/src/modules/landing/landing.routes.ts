const { Router } = require('express');
const landingController = require('./landing.controller');
const { validate } = require('../../common/middleware/validation.middleware');
const asyncHandler = require('../../common/utils/asyncHandler');
const { landingListSchema } = require('./landing.validation');

const router = Router();

router.get(
  '/featured-jobs',
  validate(landingListSchema),
  asyncHandler(landingController.getFeaturedJobs)
);
router.get(
  '/top-freelancers',
  validate(landingListSchema),
  asyncHandler(landingController.getTopFreelancers)
);
router.get(
  '/freelancers',
  validate(landingListSchema),
  asyncHandler(landingController.listFreelancers)
);

module.exports = router;
