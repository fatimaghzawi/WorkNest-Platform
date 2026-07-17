const authService = require('../services/auth.service');
const jwtConfig = require('../config/jwt');
const { sendSuccess } = require('../utils/response');
const { extractRefreshToken } = require('../utils/extractRefreshToken');
const { clientPath } = require('../utils/appUrls');

const setAccessTokenCookie = (res, token: string) => {
  res.cookie(jwtConfig.cookie.name, token, {
    httpOnly: jwtConfig.cookie.httpOnly,
    secure: jwtConfig.cookie.secure,
    sameSite: jwtConfig.cookie.sameSite,
    maxAge: jwtConfig.cookie.maxAge,
  });
};

const setRefreshTokenCookie = (res, token: string) => {
  res.cookie(jwtConfig.refreshCookie.name, token, {
    httpOnly: jwtConfig.refreshCookie.httpOnly,
    secure: jwtConfig.refreshCookie.secure,
    sameSite: jwtConfig.refreshCookie.sameSite,
    maxAge: jwtConfig.refreshCookie.maxAge,
    path: jwtConfig.refreshCookie.path,
  });
};

const clearAccessTokenCookie = (res) => {
  res.clearCookie(jwtConfig.cookie.name, {
    httpOnly: jwtConfig.cookie.httpOnly,
    secure: jwtConfig.cookie.secure,
    sameSite: jwtConfig.cookie.sameSite,
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(jwtConfig.refreshCookie.name, {
    httpOnly: jwtConfig.refreshCookie.httpOnly,
    secure: jwtConfig.refreshCookie.secure,
    sameSite: jwtConfig.refreshCookie.sameSite,
    path: jwtConfig.refreshCookie.path,
  });
};

const setAuthCookies = (res, accessToken: string, refreshToken: string) => {
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, refreshToken);
};

const clearAuthCookies = (res) => {
  clearAccessTokenCookie(res);
  clearRefreshTokenCookie(res);
};

const register = async (req, res) => {
  const result = await authService.register(req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: result.message,
  });
};

const verifyEmail = async (req, res, next) => {
  const wantsHtml = req.accepts(['html', 'json']) === 'html';
  const loginUrl = clientPath('/login');

  try {
    const result = await authService.verifyEmail(req.params.token);

    // Phone/email clients open this as HTML — send them to the app login screen.
    if (wantsHtml) {
      return res.redirect(302, `${loginUrl}?verified=1`);
    }

    return sendSuccess(res, { message: result.message });
  } catch (error) {
    if (wantsHtml && error.statusCode) {
      const message = encodeURIComponent(error.message || 'Invalid or expired verification link.');
      return res.redirect(302, `${loginUrl}?verified=0&error=${message}`);
    }

    return next(error);
  }
};

const login = async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.login(req.body);
  setAuthCookies(res, accessToken, refreshToken);
  return res.status(200).json({ success: true, user, accessToken });
};

const googleLogin = async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.googleLogin(req.body);
  setAuthCookies(res, accessToken, refreshToken);
  return res.status(200).json({ success: true, user, accessToken });
};

const startGithubAuth = async (req, res) => {
  const role = typeof req.query.role === 'string' ? req.query.role : undefined;
  const url = authService.getGithubAuthorizationUrl(role);
  return res.redirect(url);
};

const githubCallback = async (req, res) => {
  try {
    const { accessToken, refreshToken } = await authService.completeGithubOAuth(
      req.query.code,
      req.query.state
    );
    setAuthCookies(res, accessToken, refreshToken);
    return res.redirect(302, clientPath('/auth/oauth/callback?provider=github'));
  } catch (error) {
    const message = encodeURIComponent(error.message || 'GitHub sign-in failed');
    return res.redirect(302, clientPath(`/login?oauthError=${message}`));
  }
};

const refresh = async (req, res) => {
  const rawRefreshToken = extractRefreshToken(req);
  const { accessToken, refreshToken, user } = await authService.refreshSession(rawRefreshToken);
  setAuthCookies(res, accessToken, refreshToken);
  return res.status(200).json({ success: true, user, accessToken });
};

const logout = async (req, res) => {
  await authService.revokeRefreshToken(extractRefreshToken(req));
  clearAuthCookies(res);
  return sendSuccess(res, { message: 'Logged out successfully' });
};

const forgotPassword = async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  return sendSuccess(res, { message: result.message });
};

const resetPassword = async (req, res) => {
  const result = await authService.resetPassword(req.params.token, req.body.password);
  return sendSuccess(res, { message: result.message });
};

const openResetPassword = async (req, res) => {
  const token = encodeURIComponent(req.params.token);
  return res.redirect(302, clientPath(`/reset-password/${token}`));
};

const getMe = async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  return res.status(200).json({ success: true, user });
};

module.exports = {
  register,
  verifyEmail,
  login,
  googleLogin,
  startGithubAuth,
  githubCallback,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  openResetPassword,
  getMe,
};
