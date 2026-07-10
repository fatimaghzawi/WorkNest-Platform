const { ZodError } = require('zod');
const env = require('../config/env');
const { sendError } = require('../utils/response');
const { formatZodErrors } = require('./validation.middleware');
const { logFromRequest, logError } = require('../utils/logger');

const persistErrorLog = (req, { level, message, statusCode, category, meta = undefined }) => {
  if (!req) return;
  logFromRequest(req, { level, message, statusCode, category, meta });
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ZodError || err.isValidationError) {
    persistErrorLog(req, {
      level: 'warning',
      message: 'Validation failed',
      statusCode: 400,
      category: 'validation',
      meta: { errors: formatZodErrors(err) },
    });

    return sendError(res, {
      statusCode: 400,
      message: 'Validation failed',
      errors: formatZodErrors(err),
    });
  }

  if (err.name === 'CastError') {
    persistErrorLog(req, {
      level: 'warning',
      message: 'Invalid resource ID',
      statusCode: 400,
      category: 'request',
    });

    return sendError(res, {
      statusCode: 400,
      message: 'Invalid resource ID',
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    persistErrorLog(req, {
      level: 'warning',
      message: `${field} already exists`,
      statusCode: 409,
      category: 'database',
      meta: { field },
    });

    return sendError(res, {
      statusCode: 409,
      message: `${field} already exists`,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    persistErrorLog(req, {
      level: 'warning',
      message: 'Invalid token',
      statusCode: 401,
      category: 'auth',
    });

    return sendError(res, {
      statusCode: 401,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    persistErrorLog(req, {
      level: 'warning',
      message: 'Token expired',
      statusCode: 401,
      category: 'auth',
    });

    return sendError(res, {
      statusCode: 401,
      message: 'Token expired',
    });
  }

  if (err.isOperational) {
    const statusCode = err.statusCode || 500;
    const level = statusCode >= 500 ? 'error' : 'warning';

    persistErrorLog(req, {
      level,
      message: err.message,
      statusCode,
      category: 'application',
    });

    return sendError(res, {
      statusCode,
      message: err.message,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (!env.isProduction) {
    console.error(err);
  } else {
    console.error('[Error]', err.message || err);
  }

  persistErrorLog(req, {
    level: 'error',
    message,
    statusCode,
    category: 'system',
    meta: !env.isProduction ? { stack: err.stack } : null,
  });

  return sendError(res, {
    statusCode,
    message: statusCode === 500 && env.isProduction ? 'Internal server error' : message,
    errors: !env.isProduction && statusCode === 500 ? [{ field: 'stack', message: err.stack }] : null,
  });
};

module.exports = errorHandler;
