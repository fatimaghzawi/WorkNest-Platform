const crypto = require('crypto');

/** Attach a correlation/request ID to every request for tracing. */
const requestIdMiddleware = (req, res, next) => {
  const incoming = req.headers['x-request-id'];
  const requestId =
    typeof incoming === 'string' && incoming.trim().length > 0
      ? incoming.trim().slice(0, 64)
      : crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};

module.exports = requestIdMiddleware;
