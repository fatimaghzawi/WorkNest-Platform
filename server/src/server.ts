const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./common/database/db');
const initSocket = require('./shared/sockets');
const emailService = require('./shared/integrations/email').emailService;
const notificationService = require('./modules/notifications').notificationService;
const { logInfo, logError, pinoLogger } = require('./common/utils/logger');

let httpServer;
let io;

const SHUTDOWN_TIMEOUT_MS = 10_000;

const startServer = async () => {
  await connectDB();

  httpServer = http.createServer(app);
  io = initSocket(httpServer);

  app.set('io', io);
  notificationService.setSocketIo(io);

  httpServer.on('error', (error) => {
    if (error?.code === 'EADDRINUSE') {
      console.error(
        `Port ${env.port} is already in use. Stop the other server (Ctrl+C in its terminal) before running npm run dev again.`
      );
      process.exit(1);
      return;
    }

    console.error('HTTP server error:', error);
    process.exit(1);
  });

  httpServer.listen(env.port, async () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    console.log(`APP_URL: ${env.appUrl}`);
    console.log(`Email provider: ${env.email.provider}`);
    console.log(`Health: ${env.appUrl}/api/v1/health`);
    console.log(`Ready:  ${env.appUrl}/api/v1/health/ready`);

    try {
      await emailService.verifyConnection();
      logInfo(`WorkNest API started on port ${env.port}`, {
        source: 'system',
        category: 'startup',
        meta: { environment: env.nodeEnv, appUrl: env.appUrl },
      });
    } catch (error) {
      logError('Email service unavailable at startup', {
        source: 'system',
        category: 'startup',
        meta: { message: error.message },
      });
      // Do not kill the API for transient email outages in production.
      if (!env.isProduction) {
        console.error('Server startup aborted: email is not working (dev fail-fast).');
        process.exit(1);
      }
      console.warn('Continuing without verified email — check mail credentials.');
    }
  });
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  pinoLogger.info({ signal }, 'Graceful shutdown started');

  const forceExit = setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExit.unref?.();

  try {
    if (io) {
      await new Promise((resolve) => io.close(() => resolve(undefined)));
    }

    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((err) => (err ? reject(err) : resolve(undefined)));
      });
      console.log('HTTP server closed');
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
    return;
  }

  clearTimeout(forceExit);
  process.exit(0);
};

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('unhandledRejection', (error: unknown) => {
  console.error('Unhandled rejection:', error);
  logError('Unhandled promise rejection', {
    source: 'system',
    category: 'runtime',
    meta: { message: error instanceof Error ? error.message : String(error) },
  });
  void shutdown('unhandledRejection');
});

process.on('uncaughtException', (error: unknown) => {
  console.error('Uncaught exception:', error);
  logError('Uncaught exception', {
    source: 'system',
    category: 'runtime',
    meta: { message: error instanceof Error ? error.message : String(error) },
  });
  void shutdown('uncaughtException');
});

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
};
