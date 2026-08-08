const { Router } = require('express');
const dashboardController = require('./dashboard.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const asyncHandler = require('../../common/utils/asyncHandler');
const {
  chartQuerySchema,
  latestCustomersSchema,
  recentJobsSchema,
  statisticsQuerySchema,
} = require('./dashboard.validation');

const router = Router();

router.get(
  '/client',
  authenticate,
  authorize('client'),
  asyncHandler(dashboardController.getClientDashboard)
);

router.get(
  '/freelancer',
  authenticate,
  authorize('freelancer'),
  asyncHandler(dashboardController.getFreelancerDashboard)
);

router.use(authenticate, authorize('admin'));

router.get('/', asyncHandler(dashboardController.getAdminDashboard));
router.get('/stats', asyncHandler(dashboardController.getOverview));
router.get('/overview', asyncHandler(dashboardController.getOverview));
router.get(
  '/analytics/chart',
  validate(chartQuerySchema),
  asyncHandler(dashboardController.getAnalyticsChart)
);
router.get(
  '/customers/latest',
  validate(latestCustomersSchema),
  asyncHandler(dashboardController.getLatestCustomers)
);
router.get(
  '/jobs/recent',
  validate(recentJobsSchema),
  asyncHandler(dashboardController.getRecentJobs)
);
router.get(
  '/statistics',
  validate(statisticsQuerySchema),
  asyncHandler(dashboardController.getStatistics)
);

module.exports = router;
