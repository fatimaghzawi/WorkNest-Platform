const express = require('express');
require('./models/registerModels');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const routes = require('./routes');
const authRoutes = require('./routes/auth.routes');
const paymentController = require('./controllers/payment.controller');
const asyncHandler = require('./utils/asyncHandler');
const { getUploadsRoot } = require('./utils/uploadPaths');
const logger = require('./middlewares/logger.middleware');
const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(compression());

app.post(
  '/api/v1/payments/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  asyncHandler(paymentController.stripeWebhook)
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(logger);

app.use(
  '/uploads',
  express.static(getUploadsRoot(), {
    maxAge: env.isProduction ? '7d' : 0,
  })
);

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

app.use('/api/auth', authRoutes);
app.use('/api/v1', routes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to WorkNest API',
    docs: '/api/v1/health',
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
