/**
 * Express application factory.
 * Process bootstrap (listen, sockets, shutdown) lives in `server.ts`.
 * Feature routes: `/api/auth` (auth module) + `/api/v1/*` (routes/index.ts).
 */
const express = require('express');
require('./common/database/registerModels');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const routes = require('./routes');
const { authRoutes } = require('./modules/auth');
const { paymentController } = require('./modules/payments');
const asyncHandler = require('./common/utils/asyncHandler');
const { getUploadSubfolder } = require('./common/utils/uploadPaths');
const requestId = require('./common/middleware/requestId.middleware');
const csrfOriginGuard = require('./common/middleware/csrfOrigin.middleware');
const { registerSecureUploadRoutes } = require('./common/middleware/secureUploads.middleware');
const logger = require('./common/middleware/logger.middleware');
const notFound = require('./common/middleware/notFound.middleware');
const errorHandler = require('./common/middleware/error.middleware');

const app = express();

app.set('trust proxy', 1);

app.use(requestId);

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(compression());

app.post(
  '/api/v1/payments/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  asyncHandler(paymentController.stripeWebhook)
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(csrfOriginGuard);
app.use(logger);

// Profile avatars remain publicly readable (UUID filenames).
app.use(
  '/uploads/profile',
  express.static(getUploadSubfolder('profile'), {
    maxAge: env.isProduction ? '7d' : 0,
    index: false,
    redirect: false,
    fallthrough: false,
  })
);

// Workspace files require authentication + job membership.
registerSecureUploadRoutes(app);

const limiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => !env.isProduction,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

app.use('/api', limiter);

// Auth stays outside /api/v1 so existing clients keep /api/auth/*.
app.use('/api/auth', authRoutes);
app.use('/api/v1', routes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to WorkNest API',
    docs: '/api/v1/health',
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
