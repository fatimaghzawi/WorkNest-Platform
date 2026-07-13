const env = require('./env');

const googleConfig = {
  clientId: env.google.clientId,
  isConfigured: Boolean(env.google.clientId),
};

module.exports = googleConfig;
