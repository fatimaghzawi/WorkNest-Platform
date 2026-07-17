const env = require('./env');
const { appPath } = require('../utils/appUrls');

const githubConfig = {
  clientId: env.github.clientId,
  clientSecret: env.github.clientSecret,
  callbackUrl: appPath('/api/auth/github/callback'),
  isConfigured: Boolean(env.github.clientId && env.github.clientSecret),
};

module.exports = githubConfig;
