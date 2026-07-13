const env = require('./env');
const { parseDurationToMs } = require('../utils/parseDuration');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const getCookieSameSite = () => {
  if (!env.isProduction) {
    return 'lax';
  }

  try {
    const clientOrigin = new URL(env.clientUrl).origin;
    const apiOrigin = new URL(env.appUrl).origin;

    if (clientOrigin === apiOrigin) {
      return 'strict';
    }

    const clientBase = new URL(env.clientUrl).hostname.split('.').slice(-2).join('.');
    const apiBase = new URL(env.appUrl).hostname.split('.').slice(-2).join('.');

    // e.g. both on render.com subdomains
    if (clientBase === apiBase) {
      return 'lax';
    }

    // e.g. Vercel frontend + Render API
    return 'none';
  } catch {
    return 'lax';
  }
};

const sameSite = getCookieSameSite();

const jwtConfig = {
  access: {
    secret: env.jwt.secret,
    expiresIn: env.jwt.expiresIn,
  },
  refresh: {
    secret: env.jwt.refreshSecret,
    expiresIn: env.jwt.refreshExpiresIn,
    expiresInMs: parseDurationToMs(env.jwt.refreshExpiresIn, THIRTY_DAYS_MS),
  },
  cookie: {
    name: 'accessToken',
    httpOnly: true,
    secure: env.isProduction,
    sameSite,
    maxAge: parseDurationToMs(env.jwt.expiresIn, ONE_DAY_MS),
  },
  refreshCookie: {
    name: 'refreshToken',
    httpOnly: true,
    secure: env.isProduction,
    sameSite,
    maxAge: parseDurationToMs(env.jwt.refreshExpiresIn, THIRTY_DAYS_MS),
    path: '/api/auth',
  },
};

module.exports = jwtConfig;
