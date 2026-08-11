/**
 * /api/v1 router — mounts feature modules (import barrels only).
 * Auth is mounted separately at /api/auth in app.ts.
 */
const { Router } = require('express');
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../common/utils/response');

const { userRoutes, profileRoutes } = require('../modules/users');
const { categoryRoutes } = require('../modules/categories');
const { jobRoutes } = require('../modules/jobs');
const { proposalRoutes } = require('../modules/proposals');
const { interviewRoutes } = require('../modules/interviews');
const { workspaceRoutes } = require('../modules/workspace');
const { projectRoutes } = require('../modules/projects');
const { paymentRoutes } = require('../modules/payments');
const { notificationRoutes } = require('../modules/notifications');
const { dashboardRoutes } = require('../modules/dashboard');
const { logRoutes } = require('../modules/logs');
const { landingRoutes } = require('../modules/landing');
const { matchingRoutes } = require('../modules/matching');

const router = Router();

// ── Health ──────────────────────────────────────────────────────────────────

/** Liveness — process is up (for orchestrators). */
router.get('/health/live', (req, res) => {
  return sendSuccess(res, {
    message: 'alive',
    data: { status: 'ok' },
  });
});

/** Readiness — Mongo connectivity. */
router.get('/health/ready', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  if (!ready) {
    return sendError(res, {
      statusCode: 503,
      message: 'Database not ready',
    });
  }

  return sendSuccess(res, {
    message: 'ready',
    data: { status: 'ok', mongo: 'connected' },
  });
});

/** Public health (no internal config leakage). */
router.get('/health', (req, res) => {
  return sendSuccess(res, {
    message: 'WorkNest API is running',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

// ── Feature modules ─────────────────────────────────────────────────────────

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
router.use('/matching', matchingRoutes);

module.exports = router;
