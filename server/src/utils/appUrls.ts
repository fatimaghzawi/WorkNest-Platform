const env = require('../config/env');

const trimTrailingSlash = (value = '') => String(value).trim().replace(/\/$/, '');

const getClientOrigin = () => trimTrailingSlash(env.clientUrl);

const getAppOrigin = () => trimTrailingSlash(env.appUrl);

/** Build an absolute frontend URL, e.g. clientPath('/login'). */
const clientPath = (pathname = '/') => {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${getClientOrigin()}${path}`;
};

/** Build an absolute API URL, e.g. appPath('/api/auth/verify-email/xyz'). */
const appPath = (pathname = '/') => {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${getAppOrigin()}${path}`;
};

module.exports = {
  trimTrailingSlash,
  getClientOrigin,
  getAppOrigin,
  clientPath,
  appPath,
};
