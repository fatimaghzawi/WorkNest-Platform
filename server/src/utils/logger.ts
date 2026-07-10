const logService = require('../services/log.service');

const getClientIp = (req) =>
  String(req.headers['x-forwarded-for'] || req.ip || '')
    .split(',')[0]
    .trim() || null;

const writeLog = (payload) => logService.writeLogSafe(payload);

const logInfo = (message, extra = {}) =>
  writeLog({ level: 'info', message, ...extra });

const logWarning = (message, extra = {}) =>
  writeLog({ level: 'warning', message, ...extra });

const logError = (message, extra = {}) =>
  writeLog({ level: 'error', message, ...extra });

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
};
