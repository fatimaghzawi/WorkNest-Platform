const paymentRoutes = require('./payment.routes');
const paymentController = require('./payment.controller');
const paymentService = require('./payment.service');
const paymentRepository = require('./payment.repository');
const Payment = require('./payment.model').default;
const { PAYMENT_STATUSES } = require('./payment.model');
const { calculatePlatformFee } = require('./payments.constants');

module.exports = {
  paymentRoutes,
  paymentController,
  paymentService,
  paymentRepository,
  Payment,
  PAYMENT_STATUSES,
  calculatePlatformFee,
};
