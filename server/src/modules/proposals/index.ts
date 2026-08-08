const proposalRoutes = require('./proposal.routes');
const proposalController = require('./proposal.controller');
const proposalService = require('./proposal.service');
const proposalRepository = require('./proposal.repository');
const Proposal = require('./proposal.model').default;
const { PROPOSAL_STATUSES } = require('./proposal.model');

module.exports = {
  proposalRoutes,
  proposalController,
  proposalService,
  proposalRepository,
  Proposal,
  PROPOSAL_STATUSES,
};
