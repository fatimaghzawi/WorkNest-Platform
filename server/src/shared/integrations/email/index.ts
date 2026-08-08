const emailService = require('./email.service');
const eventEmailService = require('./eventEmail.service');
const templateService = require('./template.service');
const emailConfig = require('./email.config');
const { createTransporter } = require('./transporter');

module.exports = {
  emailService,
  eventEmailService,
  templateService,
  emailConfig,
  createTransporter,
};
