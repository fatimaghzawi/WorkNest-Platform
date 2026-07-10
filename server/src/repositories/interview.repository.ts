const Interview = require('../models/Interview').default;
require('../models/User').default;
require('../models/Job').default;
require('../models/Proposal').default;

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
  select: 'title status budget category deadline clientId',
};

const create = (data) => Interview.create(data);

const findById = (id: string) =>
  Interview.findById(id)
    .populate(CLIENT_POPULATE)
    .populate(FREELANCER_POPULATE)
    .populate(JOB_POPULATE);

const findAll = ({ filter, skip, limit, sort }) => {
  let query = Interview.find(filter)
    .sort(sort || { scheduledDate: 1 })
    .populate(CLIENT_POPULATE)
    .populate(FREELANCER_POPULATE)
    .populate(JOB_POPULATE);

  if (typeof skip === 'number') query = query.skip(skip);
  if (typeof limit === 'number') query = query.limit(limit);

  return query;
};

const count = (filter) => Interview.countDocuments(filter);

const updateById = (id: string, data) =>
  Interview.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true })
    .populate(CLIENT_POPULATE)
    .populate(FREELANCER_POPULATE)
    .populate(JOB_POPULATE);

const deleteById = (id: string) => Interview.findByIdAndDelete(id);

const deleteByJobId = (jobId: string) => Interview.deleteMany({ jobId });

const cancelActiveByJobId = (jobId: string) =>
  Interview.updateMany(
    { jobId, status: { $in: ['scheduled', 'confirmed'] } },
    { status: 'cancelled' }
  );

module.exports = {
  create,
  findById,
  findAll,
  count,
  updateById,
  deleteById,
  deleteByJobId,
  cancelActiveByJobId,
};
