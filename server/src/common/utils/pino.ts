const pino = require('pino');
const env = require('../../config/env');

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'cookies',
  'secret',
  'apiKey',
  'stripeSecretKey',
  'webhookSecret',
  'emailVerificationToken',
  'passwordResetToken',
]);

const redactDeep = (value, depth = 0) => {
  if (depth > 6 || value == null) return value;
  if (Array.isArray(value)) return value.map((item) => redactDeep(item, depth + 1));
  if (typeof value !== 'object') return value;

  const out = {};
  for (const [key, nested] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(key) || /token|password|secret|authorization|cookie/i.test(key)) {
      out[key] = '[REDACTED]';
    } else {
      out[key] = redactDeep(nested, depth + 1);
    }
  }
  return out;
};

const pinoLogger = pino({
  level: env.isProduction ? 'info' : 'debug',
  base: { service: 'worknest-api', env: env.nodeEnv },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'accessToken',
      'refreshToken',
    ],
    remove: true,
  },
});

module.exports = {
  pinoLogger,
  redactDeep,
};
