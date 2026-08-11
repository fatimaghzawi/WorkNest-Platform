const matchingService = require('./matching.service');
const { sendSuccess } = require('../../common/utils/response');

/** GET /matching/jobs — freelancer job suggestions (read-only). */
const suggestJobs = async (req, res) => {
  const result = await matchingService.suggestJobsForFreelancer(req.user.id, req.query);
  return sendSuccess(res, {
    message: 'Job suggestions retrieved successfully',
    data: result.suggestions,
    meta: result.meta,
  });
};

/** GET /matching/jobs/:jobId/freelancers — client talent suggestions (read-only). */
const suggestFreelancers = async (req, res) => {
  const result = await matchingService.suggestFreelancersForJob(
    req.user.id,
    req.params.jobId,
    req.query
  );
  return sendSuccess(res, {
    message: 'Freelancer suggestions retrieved successfully',
    data: {
      suggestions: result.suggestions,
      job: result.job,
    },
    meta: result.meta,
  });
};

module.exports = {
  suggestJobs,
  suggestFreelancers,
};
