const Payment = require('../models/Payment').default;

const create = (data) => Payment.create(data);

const findById = (id: string) => Payment.findById(id).lean();

const findByProjectId = (projectId: string) => Payment.findOne({ projectId }).lean();

const findByProjectIds = (projectIds: string[]) =>
  Payment.find({ projectId: { $in: projectIds } }).lean();

const updateById = (id: string, data) =>
  Payment.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true }).lean();

const updateByProjectId = (projectId: string, data) =>
  Payment.findOneAndUpdate({ projectId }, data, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();

const deleteByProjectId = (projectId: string) => Payment.deleteOne({ projectId });

const deleteByJobId = (jobId: string) => Payment.deleteMany({ jobId });

const findForUser = ({ userId, role, status, skip, limit }) => {
  const filter: Record<string, unknown> = {};
  if (role === 'client') filter.clientId = userId;
  else if (role === 'freelancer') filter.freelancerId = userId;
  if (status) filter.status = status;

  return Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
};

const countForUser = (userId: string, role: string, status?: string) => {
  const filter: Record<string, unknown> = {};
  if (role === 'client') filter.clientId = userId;
  else if (role === 'freelancer') filter.freelancerId = userId;
  if (status) filter.status = status;
  return Payment.countDocuments(filter);
};

const sumForUser = async (userId: string, role: string, status: string) => {
  const match: Record<string, unknown> = { status };
  if (role === 'client') match.clientId = userId;
  else if (role === 'freelancer') match.freelancerId = userId;

  const rows = await Payment.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  return rows[0]?.total || 0;
};

module.exports = {
  create,
  findById,
  findByProjectId,
  findByProjectIds,
  updateById,
  updateByProjectId,
  deleteByProjectId,
  deleteByJobId,
  findForUser,
  countForUser,
  sumForUser,
};
