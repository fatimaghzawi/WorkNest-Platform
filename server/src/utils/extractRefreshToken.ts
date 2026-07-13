const jwtConfig = require('../config/jwt');

const extractRefreshToken = (req) => {
  const cookieToken = req.cookies?.[jwtConfig.refreshCookie.name];
  if (cookieToken) return cookieToken;
  return null;
};

module.exports = { extractRefreshToken };
