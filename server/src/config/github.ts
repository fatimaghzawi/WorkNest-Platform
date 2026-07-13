const env = require('./env');

const githubConfig = {
  clientId: env.github.clientId,
  clientSecret: env.github.clientSecret,
  callbackUrl: `${env.appUrl}/api/auth/github/callback`,
  isConfigured: Boolean(env.github.clientId && env.github.clientSecret),
};

module.exports = githubConfig;
