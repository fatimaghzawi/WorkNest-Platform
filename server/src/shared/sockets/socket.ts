const { Server } = require('socket.io');
const env = require('../../config/env');
const jwtConfig = require('../../config/jwt');
const { verifyAccessToken } = require('../../common/utils/jwt');
const authRepository = require('../../modules/auth/auth.repository');
const { pinoLogger } = require('../../common/utils/pino');

const parseCookies = (cookieHeader = '') => {
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;
    const separator = trimmed.indexOf('=');
    if (separator === -1) return;
    const key = trimmed.slice(0, separator);
    const value = trimmed.slice(separator + 1);
    cookies[key] = decodeURIComponent(value);
  });
  return cookies;
};

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket, next) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const authHeader = socket.handshake.headers.authorization;
      const bearerToken =
        typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
          ? authHeader.slice(7).trim()
          : null;
      const token =
        cookies[jwtConfig.cookie.name] ||
        socket.handshake.auth?.token ||
        bearerToken;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyAccessToken(token);
      const user = await authRepository.findByIdForAuth(decoded.id);

      if (!user || !user.isActive) {
        return next(new Error('Authentication required'));
      }

      const userPwdChangedAt = user.passwordChangedAt?.getTime() || 0;
      if (userPwdChangedAt > (decoded.pwdChangedAt || 0)) {
        return next(new Error('Session expired. Please log in again.'));
      }

      socket.data.userId = user._id.toString();
      socket.data.role = user.role;
      return next();
    } catch {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const userRoom = `user:${userId}`;

    socket.join(userRoom);
    pinoLogger.debug({ socketId: socket.id, userId }, 'Socket connected');

    socket.on('disconnect', () => {
      pinoLogger.debug({ socketId: socket.id, userId }, 'Socket disconnected');
    });
  });

  return io;
};

module.exports = initSocket;
