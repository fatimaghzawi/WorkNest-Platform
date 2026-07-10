const env = require('./env');

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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
  cookie: {
    name: 'accessToken',
    httpOnly: true,
    secure: env.isProduction,
    sameSite,
    maxAge: ONE_DAY_MS,
  },
};

module.exports = jwtConfig;
