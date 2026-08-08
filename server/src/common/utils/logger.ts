const logService = require('../../modules/logs/log.service');
const { pinoLogger, redactDeep } = require('./pino');

const getClientIp = (req) =>
  String(req.headers['x-forwarded-for'] || req.ip || '')
    .split(',')[0]
    .trim() || null;

const writeLog = (payload) => {
  const safe = {
    ...payload,
    meta: payload?.meta != null ? redactDeep(payload.meta) : undefined,
  };

  const level = safe.level === 'warning' ? 'warn' : safe.level || 'info';
  const logFn = pinoLogger[level] || pinoLogger.info;
  logFn.call(pinoLogger, {
    requestId: safe.requestId,
    source: safe.source,
    category: safe.category,
    statusCode: safe.statusCode,
    method: safe.method,
    path: safe.path,
    userId: safe.userId,
    actorEmail: safe.actorEmail,
    ip: safe.ip,
    meta: safe.meta,
    msg: safe.message,
  });

  return logService.writeLogSafe(safe);
};

const logInfo = (message, extra = {}) => writeLog({ level: 'info', message, ...extra });

const logWarning = (message, extra = {}) => writeLog({ level: 'warning', message, ...extra });

const logError = (message, extra = {}) => writeLog({ level: 'error', message, ...extra });

const logFromRequest = (req, { level, message, statusCode, category, meta = undefined }) => {
  writeLog({
    level,
    message,
    source: 'api',
    category: category || 'request',
    statusCode,
    method: req.method,
    path: req.originalUrl || req.url,
    userId: req.user?._id || req.user?.id || null,
    actorEmail: req.user?.email || null,
    ip: getClientIp(req),
    requestId: req.requestId || null,
    meta,
  });
};

module.exports = {
  writeLog,
  logInfo,
  logWarning,
  logError,
  logFromRequest,
  getClientIp,
  pinoLogger,
};
