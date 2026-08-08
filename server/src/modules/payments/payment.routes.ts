const { Router } = require('express');
const paymentController = require('./payment.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const asyncHandler = require('../../common/utils/asyncHandler');
const {
  createCheckoutSessionSchema,
  confirmCheckoutSchema,
  projectIdSchema,
  listPaymentsSchema,
} = require('./payment.validation');

const router = Router();

router.use(authenticate);

router.get('/wallet', authorize('client', 'freelancer', 'admin'), asyncHandler(paymentController.getWalletSummary));
router.get('/', authorize('client', 'freelancer', 'admin'), validate(listPaymentsSchema), asyncHandler(paymentController.listPayments));
router.get(
  '/project/:projectId',
  authorize('client', 'freelancer', 'admin'),
  validate(projectIdSchema),
  asyncHandler(paymentController.getPaymentByProject)
);

router.use(authorize('client', 'freelancer'));
router.post(
  '/project/:projectId/checkout-session',
  authorize('client'),
  validate(createCheckoutSessionSchema),
  asyncHandler(paymentController.createCheckoutSession)
);
router.post(
  '/project/:projectId/confirm-checkout',
  authorize('client'),
  validate(confirmCheckoutSchema),
  asyncHandler(paymentController.confirmCheckoutSession)
);

module.exports = router;
