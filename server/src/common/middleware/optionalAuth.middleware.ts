const { verifyAccessToken } = require('../utils/jwt');
const { extractAccessToken } = require('../utils/extractAccessToken');
const authRepository = require('../../modules/auth/auth.repository');

/**
 * Soft auth — attaches req.user when a valid token is present.
 * Never fails the request (used for public endpoints with role-aware filtering).
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = extractAccessToken(req);
    if (!token) return next();

    const decoded = verifyAccessToken(token);
    const user = await authRepository.findByIdForAuth(decoded.id);
    if (!user || !user.isActive) return next();

    const userPwdChangedAt = user.passwordChangedAt?.getTime() || 0;
    if (userPwdChangedAt > (decoded.pwdChangedAt || 0)) return next();

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  } catch {
    // ignore invalid tokens on public routes
  }
  return next();
};

module.exports = {
  optionalAuthenticate,
};
