const { Router } = require('express');
const { sendSuccess } = require('../utils/response');
const env = require('../config/env');

const userRoutes = require('./user.routes');
const profileRoutes = require('./profile.routes');
const categoryRoutes = require('./category.routes');
const jobRoutes = require('./job.routes');
const proposalRoutes = require('./proposal.routes');
const interviewRoutes = require('./interview.routes');
const workspaceRoutes = require('./workspace.routes');
const projectRoutes = require('./project.routes');
const paymentRoutes = require('./payment.routes');
const notificationRoutes = require('./notification.routes');
const dashboardRoutes = require('./dashboard.routes');
const logRoutes = require('./log.routes');
const landingRoutes = require('./landing.route');

const router = Router();

router.get('/health', (req, res) => {
  return sendSuccess(res, {
    message: 'WorkNest API is running',
    data: {
      timestamp: new Date().toISOString(),
      appUrl: env.appUrl,
      clientUrl: env.clientUrl,
      allowedOrigins: env.allowedOrigins,
      deployMarker: 'cors-multi-origin-2026-07-17',
    },
  });
});

router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/categories', categoryRoutes);
router.use('/jobs', jobRoutes);
router.use('/proposals', proposalRoutes);
router.use('/interviews', interviewRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/projects', projectRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/logs', logRoutes);
router.use('/landing', landingRoutes);

module.exports = router;
