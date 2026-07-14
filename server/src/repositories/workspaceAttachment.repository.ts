const mongoose = require('mongoose');
const WorkspaceAttachment = require('../models/WorkspaceAttachment').default;
require('../models/User').default;
require('../models/Job').default;
require('../models/Task').default;

const UPLOADER_POPULATE = {
  path: 'uploadedBy',
  select: 'firstName lastName email profileImage role',
};

const projectLevelFilter = () => ({
  $or: [{ taskId: null }, { taskId: { $exists: false } }],
});

const create = (data) => WorkspaceAttachment.create(data);

const findById = (id: string) =>
  WorkspaceAttachment.findById(id).populate(UPLOADER_POPULATE);

const findByJob = (jobId: string) =>
  WorkspaceAttachment.find({ jobId, ...projectLevelFilter() })
    .sort({ createdAt: -1 })
    .populate(UPLOADER_POPULATE);

const countByJob = (jobId: string) =>
  WorkspaceAttachment.countDocuments({ jobId, ...projectLevelFilter() });

const countByTask = (taskId: string) => WorkspaceAttachment.countDocuments({ taskId });

const countByTaskIds = async (taskIds: string[]) => {
  if (!taskIds.length) return {};

  const objectIds = taskIds.map((id) => new mongoose.Types.ObjectId(id));
  const rows = await WorkspaceAttachment.aggregate([
    { $match: { taskId: { $in: objectIds } } },
    { $group: { _id: '$taskId', count: { $sum: 1 } } },
  ]);

  return rows.reduce((acc, row) => {
    acc[row._id.toString()] = row.count;
    return acc;
  }, {});
};

const findByJobPaginated = ({ jobId, taskId, skip, limit }) => {
  const filter: Record<string, unknown> = { jobId };
  if (taskId) {
    filter.taskId = taskId;
  } else {
    Object.assign(filter, projectLevelFilter());
  }

  return WorkspaceAttachment.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate(UPLOADER_POPULATE);
};

const countFiltered = ({ jobId, taskId }) => {
  const filter: Record<string, unknown> = { jobId };
  if (taskId) {
    filter.taskId = taskId;
  } else {
    Object.assign(filter, projectLevelFilter());
  }
  return WorkspaceAttachment.countDocuments(filter);
};

const countTaskDeliverables = (jobId: string) =>
  WorkspaceAttachment.countDocuments({
    jobId,
    taskId: { $ne: null, $exists: true },
  });

const countTaskDeliverableGroups = async (jobId: string) => {
  const rows = await WorkspaceAttachment.aggregate([
    {
      $match: {
        jobId: new mongoose.Types.ObjectId(jobId),
        taskId: { $ne: null, $exists: true },
      },
    },
    { $group: { _id: '$taskId' } },
    { $count: 'total' },
  ]);
  return rows[0]?.total || 0;
};

const findTaskDeliverableGroupsPaginated = async ({
  jobId,
  skip,
  limit,
  previewLimit = 6,
}) => {
  const jobObjectId = new mongoose.Types.ObjectId(jobId);
  const rows = await WorkspaceAttachment.aggregate([
    {
      $match: {
        jobId: jobObjectId,
        taskId: { $ne: null, $exists: true },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$taskId',
        attachmentCount: { $sum: 1 },
        lastUploadAt: { $max: '$createdAt' },
        attachments: { $push: '$$ROOT' },
      },
    },
    { $sort: { lastUploadAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: '_id',
        as: 'task',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'attachments.uploadedBy',
        foreignField: '_id',
        as: 'uploaders',
      },
    },
    {
      $project: {
        taskId: '$_id',
        attachmentCount: 1,
        task: { $arrayElemAt: ['$task', 0] },
        attachments: { $slice: ['$attachments', previewLimit] },
        uploaders: 1,
      },
    },
  ]);

  return rows.map((row) => {
    const uploaderMap = new Map(
      (row.uploaders || []).map((user) => [user._id.toString(), user])
    );

    const attachments = (row.attachments || []).map((attachment) => {
      const uploadedBy = uploaderMap.get(attachment.uploadedBy?.toString()) || attachment.uploadedBy;
      return {
        ...attachment,
        uploadedBy,
      };
    });

    return {
      taskId: row.taskId?.toString(),
      task: row.task,
      attachments,
      attachmentCount: row.attachmentCount || 0,
    };
  });
};

const deleteById = (id: string) => WorkspaceAttachment.findByIdAndDelete(id);

const deleteByJobId = (jobId: string) => WorkspaceAttachment.deleteMany({ jobId });

const deleteByTaskId = (taskId: string) => WorkspaceAttachment.deleteMany({ taskId });

module.exports = {
  create,
  findById,
  findByJob,
  findByJobPaginated,
  countByJob,
  countByTask,
  countByTaskIds,
  countFiltered,
  countTaskDeliverables,
  countTaskDeliverableGroups,
  findTaskDeliverableGroupsPaginated,
  deleteById,
  deleteByJobId,
  deleteByTaskId,
};
