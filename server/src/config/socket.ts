const { Server } = require('socket.io');
const env = require('./env');
const jwtConfig = require('./jwt');
const { verifyAccessToken } = require('../utils/jwt');

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
      origin: env.clientUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use((socket, next) => {
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
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      return next();
    } catch {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const userRoom = `user:${userId}`;

    socket.join(userRoom);
    console.log(`Socket connected: ${socket.id} (user ${userId})`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initSocket;
