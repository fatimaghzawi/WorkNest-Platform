const http = require('http');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const initSocket = require('./config/socket');
const emailService = require('./services/email/email.service');
const notificationService = require('./services/notification.service');
const { logInfo, logError } = require('./utils/logger');

let httpServer;

const startServer = async () => {
  await connectDB();

  httpServer = http.createServer(app);
  const io = initSocket(httpServer);

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

    try {
      await emailService.verifyConnection();
      logInfo(`WorkNest API started on port ${env.port}`, {
        source: 'system',
        category: 'startup',
        meta: { environment: env.nodeEnv, appUrl: env.appUrl },
      });
    } catch (error) {
      logError('Server startup aborted — email service unavailable', {
        source: 'system',
        category: 'startup',
        meta: { message: error.message },
      });
      console.error('Server startup aborted: email is not working.');
      process.exit(1);
    }
  });
};

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);

  if (!httpServer) {
    process.exit(0);
    return;
  }

  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (error: unknown) => {
  console.error('Unhandled rejection:', error);
  logError('Unhandled promise rejection', {
    source: 'system',
    category: 'runtime',
    meta: { message: error instanceof Error ? error.message : String(error) },
  });
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error: unknown) => {
  console.error('Uncaught exception:', error);
  logError('Uncaught exception', {
    source: 'system',
    category: 'runtime',
    meta: { message: error instanceof Error ? error.message : String(error) },
  });
  shutdown('uncaughtException');
});

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
};
