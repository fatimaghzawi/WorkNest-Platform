const landingService = require('../services/landing.service');
const { sendSuccess } = require('../utils/response');

const getTopFreelancers = async (req, res) => {
  const topFreelancers = await landingService.getTopFreelancers();
  return sendSuccess(res, {
    message: 'Top freelancers retrieved successfully',
    data: topFreelancers,
  });
};

const listFreelancers = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const { freelancers, meta } = await landingService.listFreelancers({ page, limit });

  return sendSuccess(res, {
    message: 'Freelancers retrieved successfully',
    data: freelancers,
    meta,
  });
};

const getFeaturedJobs = async (req, res) => {
  const featuredJobs = await landingService.getFeaturedJobs();

  return sendSuccess(res, {
    message: 'Featured jobs retrieved successfully',
    data: featuredJobs,
  });
};

module.exports = {
  getTopFreelancers,
  listFreelancers,
  getFeaturedJobs,
};