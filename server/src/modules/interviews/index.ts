const interviewRoutes = require('./interview.routes');
const interviewController = require('./interview.controller');
const interviewService = require('./interview.service');
const interviewRepository = require('./interview.repository');
const Interview = require('./interview.model').default;
const { INTERVIEW_STATUSES } = require('./interview.model');

module.exports = {
  interviewRoutes,
  interviewController,
  interviewService,
  interviewRepository,
  Interview,
  INTERVIEW_STATUSES,
};
