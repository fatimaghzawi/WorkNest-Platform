const env = require('./env');

const emailConfig = {
  host: env.email.host,
  port: env.email.port,
  secure: env.email.secure,
  user: env.email.user,
  pass: env.email.pass,
  from: env.email.from,
};

module.exports = emailConfig;
