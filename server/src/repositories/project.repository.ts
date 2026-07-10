const Project = require('../models/Project').default;
require('../models/User').default;
require('../models/Job').default;

const CLIENT_POPULATE = {
  path: 'clientId',
  select: 'firstName lastName email profileImage',
};

const FREELANCER_POPULATE = {
  path: 'freelancerId',
  select: 'firstName lastName email profileImage',
};

const JOB_POPULATE = {
  path: 'jobId',
  select: 'title status budget category deadline',
};

const create = (data) => Project.create(data);

const findById = (id: string) =>
  Project.findById(id)
    .populate(CLIENT_POPULATE)
    .populate(FREELANCER_POPULATE)
    .populate(JOB_POPULATE);

const findByJobId = (jobId: string) => Project.findOne({ jobId });

const findByJobIdPopulated = (jobId: string) =>
  Project.findOne({ jobId })
    .populate(CLIENT_POPULATE)
    .populate(FREELANCER_POPULATE)
    .populate(JOB_POPULATE);

const findAll = ({ filter, skip, limit, sort }) =>
  Project.find(filter)
    .sort(sort || { createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate(CLIENT_POPULATE)
    .populate(FREELANCER_POPULATE)
    .populate(JOB_POPULATE);

const count = (filter) => Project.countDocuments(filter);

const updateById = (id: string, data) =>
  Project.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true })
    .populate(CLIENT_POPULATE)
    .populate(FREELANCER_POPULATE)
    .populate(JOB_POPULATE);

const deleteById = (id: string) => Project.findByIdAndDelete(id);

const findOrCreateFromAcceptance = async ({
  jobId,
  clientId,
  freelancerId,
  title,
}) => {
  const existing = await Project.findOne({ jobId });
  if (existing) {
    return Project.findById(existing._id)
      .populate(CLIENT_POPULATE)
      .populate(FREELANCER_POPULATE)
      .populate(JOB_POPULATE);
  }

  const created = await Project.create({
    jobId,
    clientId,
    freelancerId,
    title,
    status: 'active',
    progress: 0,
  });

  return Project.findById(created._id)
    .populate(CLIENT_POPULATE)
    .populate(FREELANCER_POPULATE)
    .populate(JOB_POPULATE);
};

module.exports = {
  create,
  findById,
  findByJobId,
  findByJobIdPopulated,
  findAll,
  count,
  updateById,
  deleteById,
  findOrCreateFromAcceptance,
};
