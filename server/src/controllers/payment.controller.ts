const paymentService = require('../services/payment.service');
const { sendSuccess } = require('../utils/response');

const getWalletSummary = async (req, res) => {
  const summary = await paymentService.getWalletSummary(req.user.id, req.user.role);
  return sendSuccess(res, {
    message: 'Wallet summary retrieved successfully',
    data: summary,
  });
};

const listPayments = async (req, res) => {
  const result = await paymentService.listPayments(req.user.id, req.user.role, req.query);
  return sendSuccess(res, {
    message: 'Payments retrieved successfully',
    data: result.payments,
    meta: result.meta,
  });
};

const getPaymentByProject = async (req, res) => {
  const payment = await paymentService.getPaymentByProject(
    req.params.projectId,
    req.user.id,
    req.user.role
  );
  return sendSuccess(res, {
    message: payment ? 'Payment retrieved successfully' : 'No payment found for this project',
    data: payment,
  });
};

const createCheckoutSession = async (req, res) => {
  const session = await paymentService.createCheckoutSession(
    req.params.projectId,
    req.user.id,
    req.body?.returnPath
  );
  return sendSuccess(res, {
    message: 'Checkout session created successfully',
    data: session,
  });
};

const confirmCheckoutSession = async (req, res) => {
  const payment = await paymentService.confirmCheckoutSession(
    req.params.projectId,
    req.user.id,
    req.body?.sessionId
  );
  return sendSuccess(res, {
    message: 'Checkout confirmed successfully',
    data: payment,
  });
};

const stripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const result = await paymentService.handleStripeWebhook(req.body, signature);
  return res.status(200).json(result);
};

module.exports = {
  getWalletSummary,
  listPayments,
  getPaymentByProject,
  createCheckoutSession,
  confirmCheckoutSession,
  stripeWebhook,
};
