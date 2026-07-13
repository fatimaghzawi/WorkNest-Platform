const { Router } = require('express');
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validation.middleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  createCheckoutSessionSchema,
  confirmCheckoutSchema,
  projectIdSchema,
  listPaymentsSchema,
} = require('../validators/payment.validator');

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
