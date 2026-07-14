const { verifyAccessToken } = require('../utils/jwt');
const { extractAccessToken } = require('../utils/extractAccessToken');
const AppError = require('../utils/AppError');
const authRepository = require('../repositories/auth.repository');

const authenticate = async (req, res, next) => {
  try {
    const token = extractAccessToken(req);

    if (!token) {
      return next(new AppError('Authentication required', 401));
    }

    const decoded = verifyAccessToken(token);
    const user = await authRepository.findByIdForAuth(decoded.id);

    if (!user || !user.isActive) {
      return next(new AppError('Authentication required', 401));
    }

    const userPwdChangedAt = user.passwordChangedAt?.getTime() || 0;
    if (userPwdChangedAt > (decoded.pwdChangedAt || 0)) {
      return next(new AppError('Session expired. Please log in again.', 401));
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch {
    return next(new AppError('Invalid or expired token', 401));
  }
};

module.exports = {
  authenticate,
};
