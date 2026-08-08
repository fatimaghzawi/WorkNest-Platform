const env = require('../../config/env');
const AppError = require('../errors/AppError');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF mitigation for cookie-authenticated browser requests.
 * Mutating requests that carry the access-token cookie must present a trusted Origin/Referer
 * (or Authorization bearer for non-browser clients).
 */
const csrfOriginGuard = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();

  const path = req.originalUrl || req.url || '';
  if (path.includes('/payments/webhooks/stripe')) return next();

  const hasAccessCookie = Boolean(req.cookies?.accessToken || req.cookies?.refreshToken);
  if (!hasAccessCookie) return next();

  const originHeader = typeof req.headers.origin === 'string' ? req.headers.origin : '';
  if (originHeader && env.allowedOrigins.includes(originHeader)) {
    return next();
  }

  const referer = typeof req.headers.referer === 'string' ? req.headers.referer : '';
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (env.allowedOrigins.includes(refOrigin)) {
        return next();
      }
    } catch {
      // ignore bad referer
    }
  }

  // Native / tooling clients often send Bearer without Origin
  const auth = req.headers.authorization;
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    return next();
  }

  if (!env.isProduction && !originHeader) {
    return next();
  }

  return next(new AppError('Cross-site request blocked', 403));
};

module.exports = csrfOriginGuard;
