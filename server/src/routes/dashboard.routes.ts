const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const asyncHandler = require('../utils/asyncHandler');

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
router.get('/analytics/chart', asyncHandler(dashboardController.getAnalyticsChart));
router.get('/customers/latest', asyncHandler(dashboardController.getLatestCustomers));
router.get('/jobs/recent', asyncHandler(dashboardController.getRecentJobs));
router.get('/statistics', asyncHandler(dashboardController.getStatistics));

module.exports = router;
