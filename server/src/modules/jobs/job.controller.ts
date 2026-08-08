const jobService = require('./job.service');
const { sendSuccess } = require('../../common/utils/response');

const listJobs = async (req, res) => {
  const isPublic = req.user?.role !== 'admin';
  const result = await jobService.listJobs(req.query, { isPublic });
  return sendSuccess(res, {
    message: 'Jobs retrieved successfully',
    data: result.jobs,
    meta: result.meta,
  });
};

const getMyJobs = async (req, res) => {
  const result = await jobService.getMyJobs(req.user.id, req.query);
  return sendSuccess(res, {
    message: 'Your jobs retrieved successfully',
    data: result.jobs,
    meta: result.meta,
  });
};

const getJob = async (req, res) => {
  const job = await jobService.getJobById(req.params.id, {
    isPublic: !req.user,
    stripClientEmail: req.user?.role !== 'admin',
  });
  return sendSuccess(res, {
    message: 'Job retrieved successfully',
    data: job,
  });
};

const createJob = async (req, res) => {
  const job = await jobService.createJob(req.user.id, req.body);
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Job created successfully',
    data: job,
  });
};

const updateJob = async (req, res) => {
  const job = await jobService.updateJob(req.params.id, req.user.id, req.body, req.user.role);
  return sendSuccess(res, {
    message: 'Job updated successfully',
    data: job,
  });
};

const updateJobStatus = async (req, res) => {
  const job = await jobService.updateJobStatus(
    req.params.id,
    req.user.id,
    req.body.status,
    req.user.role
  );
  return sendSuccess(res, {
    message: 'Job status updated successfully',
    data: job,
  });
};

const deleteJob = async (req, res) => {
  await jobService.deleteJob(req.params.id, req.user.id, req.user.role);
  const message =
    req.user.role === 'admin' ? 'Job archived successfully' : 'Job deleted successfully';
  return sendSuccess(res, { message });
};

const getJobStats = async (req, res) => {
  const stats = await jobService.getJobStats();
  return sendSuccess(res, {
    message: 'Job statistics retrieved successfully',
    data: stats,
  });
};

module.exports = {
  listJobs,
  getJobStats,
  getMyJobs,
  getJob,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
};
