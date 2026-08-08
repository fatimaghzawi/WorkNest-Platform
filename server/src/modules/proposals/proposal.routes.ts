const { Router } = require('express');
const proposalController = require('./proposal.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const asyncHandler = require('../../common/utils/asyncHandler');
const {
  proposalIdSchema,
  jobIdParamSchema,
  createProposalSchema,
  updateProposalSchema,
  updateProposalStatusSchema,
  listProposalsSchema,
} = require('./proposal.validation');

const router = Router();

router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  asyncHandler(proposalController.getProposalStats)
);

router.get(
  '/',
  authenticate,
  authorize('admin'),
  validate(listProposalsSchema),
  asyncHandler(proposalController.listAllProposals)
);

router.post(
  '/',
  authenticate,
  authorize('freelancer'),
  validate(createProposalSchema),
  asyncHandler(proposalController.createProposal)
);

router.get(
  '/my',
  authenticate,
  authorize('freelancer'),
  validate(listProposalsSchema),
  asyncHandler(proposalController.getMyProposals)
);

router.get(
  '/job/:jobId',
  authenticate,
  authorize('client'),
  validate({ ...jobIdParamSchema, query: listProposalsSchema.query }),
  asyncHandler(proposalController.getProposalsByJob)
);

router.get(
  '/:id',
  authenticate,
  validate(proposalIdSchema),
  asyncHandler(proposalController.getProposal)
);

router.patch(
  '/:id',
  authenticate,
  authorize('freelancer'),
  validate(updateProposalSchema),
  asyncHandler(proposalController.updateProposal)
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('client'),
  validate(updateProposalStatusSchema),
  asyncHandler(proposalController.updateProposalStatus)
);

router.delete(
  '/:id',
  authenticate,
  authorize('freelancer'),
  validate(proposalIdSchema),
  asyncHandler(proposalController.withdrawProposal)
);

module.exports = router;
