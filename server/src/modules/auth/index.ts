const authRoutes = require('./auth.routes');
const authController = require('./auth.controller');
const authService = require('./auth.service');
const authRepository = require('./auth.repository');
const refreshTokenRepository = require('./refreshToken.repository');
const RefreshToken = require('./refreshToken.model').default;

module.exports = {
  authRoutes,
  authController,
  authService,
  authRepository,
  refreshTokenRepository,
  RefreshToken,
};
