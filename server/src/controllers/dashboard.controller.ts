const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/response');

const getAdminDashboard = async (req, res) => {
  const data = await dashboardService.getAdminDashboard();
  return sendSuccess(res, {
    message: 'Admin dashboard retrieved successfully',
    data,
  });
};

const getOverview = async (req, res) => {
  const data = await dashboardService.getOverview();
  return sendSuccess(res, {
    message: 'Dashboard overview retrieved successfully',
    data,
  });
};

const getAnalyticsChart = async (req, res) => {
  const data = await dashboardService.getAnalyticsChart(req.query);
  return sendSuccess(res, {
    message: 'Analytics chart retrieved successfully',
    data,
  });
};

const getLatestCustomers = async (req, res) => {
  const data = await dashboardService.getLatestCustomers(req.query);
  return sendSuccess(res, {
    message: 'Latest customers retrieved successfully',
    data,
  });
};

const getRecentJobs = async (req, res) => {
  const data = await dashboardService.getRecentJobs(req.query);
  return sendSuccess(res, {
    message: 'Recent jobs retrieved successfully',
    data,
  });
};

const getStatistics = async (req, res) => {
  const data = await dashboardService.getStatistics(req.query);
  return sendSuccess(res, {
    message: 'Platform statistics retrieved successfully',
    data,
  });
};

const getClientDashboard = async (req, res) => {
  const data = await dashboardService.getClientDashboard(req.user.id);
  return sendSuccess(res, {
    message: 'Client dashboard retrieved successfully',
    data,
  });
};

const getFreelancerDashboard = async (req, res) => {
  const data = await dashboardService.getFreelancerDashboard(req.user.id);
  return sendSuccess(res, {
    message: 'Freelancer dashboard retrieved successfully',
    data,
  });
};

module.exports = {
  getAdminDashboard,
  getOverview,
  getAnalyticsChart,
  getLatestCustomers,
  getRecentJobs,
  getStatistics,
  getClientDashboard,
  getFreelancerDashboard,
};
