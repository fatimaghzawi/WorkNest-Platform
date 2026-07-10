const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const jobRepository = require('../repositories/job.repository');
const categoryService = require('../services/category.service');
const projectRepository = require('../repositories/project.repository');
const jobCleanupService = require('../services/jobCleanup.service');
const mongoose = require('mongoose');

const { NOT_DELETED_FILTER } = jobRepository;

const SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  budget_asc: { budget: 1 },
  budget_desc: { budget: -1 },
};

const buildJobFilter = (query: Record<string, unknown> = {}) => {
  const filter: Record<string, unknown> = {};

  if (query.category) {
    filter.category = String(query.category).trim();
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.clientId) {
    filter.clientId = new mongoose.Types.ObjectId(String(query.clientId));
  }

  if (query.search) {
    const searchRegex = new RegExp(String(query.search), 'i');
    filter.$or = [{ title: searchRegex }, { description: searchRegex }, { skills: searchRegex }];
  }

  if (query.budgetMin || query.budgetMax) {
    const budgetFilter: Record<string, number> = {};

    if (query.budgetMin) {
      budgetFilter.$gte = Number(query.budgetMin);
    }

    if (query.budgetMax) {
      budgetFilter.$lte = Number(query.budgetMax);
    }

    filter.budget = budgetFilter;
  }

  if (query.includeArchived !== true && query.includeArchived !== 'true') {
    Object.assign(filter, NOT_DELETED_FILTER);
  }

  return filter;
};

const assertNotArchived = (job) => {
  if (job.deletedAt) {
    throw new AppError('Job has been archived', 404);
  }
};

const listJobs = async (query: Record<string, unknown> = {}, { populate = true } = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildJobFilter(query);
  const sort = SORT_MAP[String(query.sort)] || SORT_MAP.newest;

  const [jobs, total] = await Promise.all([
    jobRepository.findAll({ filter, skip, limit, sort, populate, lean: true }),
    jobRepository.count(filter),
  ]);

  return {
    jobs,
    meta: buildPaginationMeta(total, page, limit),
  };
};

const getJobById = async (id: string) => {
  const job = await jobRepository.findById(id, { populate: true });

  if (!job || job.deletedAt) {
    throw new AppError('Job not found', 404);
  }

  return job;
};

const createJob = async (clientId: string, data) => {
  const category = await categoryService.resolveActiveCategory(data.category);

  const job = await jobRepository.create({
    ...data,
    clientId,
    category: category.slug,
  });
  return jobRepository.findById(job._id.toString(), { populate: true });
};

const assertJobOwner = (job, userId: string, userRole: string) => {
  if (userRole === 'admin') return;
  if (job.clientId.toString() !== userId) {
    throw new AppError('You can only update your own jobs', 403);
  }
};

const assertJobEditable = async (job, userRole: string) => {
  assertNotArchived(job);

  if (userRole === 'admin') return;

  if (job.status === 'closed') {
    throw new AppError('Cannot update a closed job', 400);
  }

  if (job.status === 'in_progress') {
    throw new AppError('Cannot update a job that is in progress', 400);
  }

  const project = await projectRepository.findByJobId(job._id.toString());
  if (project?.status === 'completed') {
    throw new AppError('Cannot update a job after the project has been completed', 400);
  }
};

const updateJob = async (id: string, userId: string, data, userRole = 'client') => {
  const job = await jobRepository.findById(id);

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  assertJobOwner(job, userId, userRole);
  await assertJobEditable(job, userRole);

  const updateData = { ...data };

  if (updateData.category) {
    const category = await categoryService.resolveActiveCategory(updateData.category);
    updateData.category = category.slug;
  }

  const updated = await jobRepository.updateById(id, updateData);

  if (!updated) {
    throw new AppError('Job not found', 404);
  }

  return updated;
};

const updateJobStatus = async (id: string, userId: string, status: string, userRole = 'client') => {
  if (userRole !== 'admin') {
    throw new AppError('Only admins can change job status directly', 403);
  }

  const job = await jobRepository.findById(id);

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  assertNotArchived(job);

  const updated = await jobRepository.updateById(id, { status });

  if (!updated) {
    throw new AppError('Job not found', 404);
  }

  return updated;
};

const assertClientCanDeleteJob = async (job) => {
  if (job.deletedAt) {
    throw new AppError('Job is already deleted', 400);
  }

  if (job.status !== 'open') {
    throw new AppError('Only open jobs can be deleted', 400);
  }

  const project = await projectRepository.findByJobId(job._id.toString());
  if (project) {
    throw new AppError('Cannot delete a job that already has a project', 400);
  }
};

const assertJobArchivable = async (job) => {
  if (job.deletedAt) {
    throw new AppError('Job is already archived', 400);
  }

  if (job.status === 'in_progress') {
    throw new AppError(
      'Cannot archive a job with an active project. Cancel the project first to refund escrow.',
      400
    );
  }

  if (job.status === 'closed') {
    throw new AppError('Cannot archive a closed job with completed work history', 400);
  }

  const project = await projectRepository.findByJobId(job._id.toString());
  if (project) {
    throw new AppError(
      'Cannot archive a job that already has a project. Cancel the project first.',
      400
    );
  }
};

const deleteJob = async (id: string, userId: string, userRole = 'client') => {
  const job = await jobRepository.findById(id);

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  assertJobOwner(job, userId, userRole);

  if (userRole === 'admin') {
    await assertJobArchivable(job);
    await jobRepository.softDeleteById(id);
    return;
  }

  await assertClientCanDeleteJob(job);
  await jobCleanupService.deleteOpenJobRelatedData(id);
  await jobRepository.deleteById(id);
};

const getMyJobs = async (clientId: string, query: Record<string, unknown> = {}) => {
  return listJobs({ ...query, clientId }, { populate: false });
};

const getJobStats = async () => {
  const baseFilter = { ...NOT_DELETED_FILTER };
  const [total, open, inProgress, closed] = await Promise.all([
    jobRepository.count(baseFilter),
    jobRepository.count({ ...baseFilter, status: 'open' }),
    jobRepository.count({ ...baseFilter, status: 'in_progress' }),
    jobRepository.count({ ...baseFilter, status: 'closed' }),
  ]);

  return { total, open, inProgress, closed };
};

module.exports = {
  listJobs,
  getJobStats,
  getJobById,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  getMyJobs,
};
