const Task = require('../models/Task').default;
require('../models/User').default;
require('../models/Job').default;

const CREATOR_POPULATE = {
  path: 'createdBy',
  select: 'firstName lastName email profileImage',
};

const create = (data) => Task.create(data);

const findById = (id: string) => Task.findById(id).populate(CREATOR_POPULATE);

const findByJob = (jobId: string) =>
  Task.find({ jobId }).sort({ createdAt: -1 }).populate(CREATOR_POPULATE);

const findByJobPaginated = ({ jobId, skip, limit }) =>
  Task.find({ jobId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate(CREATOR_POPULATE);

const countByJob = (jobId: string) => Task.countDocuments({ jobId });

const countDoneByJob = (jobId: string) =>
  Task.countDocuments({ jobId, status: 'done' });

const getProgressByJobIds = async (jobIds: string[]) => {
  if (!jobIds.length) return {};

  const mongoose = require('mongoose');
  const objectIds = jobIds.map((id) => new mongoose.Types.ObjectId(id));
  const rows = await Task.aggregate([
    { $match: { jobId: { $in: objectIds } } },
    {
      $group: {
        _id: '$jobId',
        total: { $sum: 1 },
        done: {
          $sum: {
            $cond: [{ $eq: ['$status', 'done'] }, 1, 0],
          },
        },
      },
    },
  ]);

  return rows.reduce((acc, row) => {
    const total = row.total || 0;
    acc[row._id.toString()] = total === 0 ? 0 : Math.round((row.done / total) * 100);
    return acc;
  }, {});
};

const updateById = (id: string, data) =>
  Task.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true }).populate(
    CREATOR_POPULATE
  );

const deleteById = (id: string) => Task.findByIdAndDelete(id);

const deleteByJobId = (jobId: string) => Task.deleteMany({ jobId });

const createMany = (items) => Task.insertMany(items);

module.exports = {
  create,
  findById,
  findByJob,
  findByJobPaginated,
  countByJob,
  countDoneByJob,
  getProgressByJobIds,
  updateById,
  deleteById,
  deleteByJobId,
  createMany,
};
