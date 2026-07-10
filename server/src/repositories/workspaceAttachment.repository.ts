const WorkspaceAttachment = require('../models/WorkspaceAttachment').default;
require('../models/User').default;
require('../models/Job').default;

const UPLOADER_POPULATE = {
  path: 'uploadedBy',
  select: 'firstName lastName email profileImage role',
};

const create = (data) => WorkspaceAttachment.create(data);

const findById = (id: string) =>
  WorkspaceAttachment.findById(id).populate(UPLOADER_POPULATE);

const findByJob = (jobId: string) =>
  WorkspaceAttachment.find({ jobId })
    .sort({ createdAt: -1 })
    .populate(UPLOADER_POPULATE);

const countByJob = (jobId: string) => WorkspaceAttachment.countDocuments({ jobId });

const findByJobPaginated = ({ jobId, skip, limit }) =>
  WorkspaceAttachment.find({ jobId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate(UPLOADER_POPULATE);

const deleteById = (id: string) => WorkspaceAttachment.findByIdAndDelete(id);

const deleteByJobId = (jobId: string) => WorkspaceAttachment.deleteMany({ jobId });

module.exports = {
  create,
  findById,
  findByJob,
  findByJobPaginated,
  countByJob,
  deleteById,
  deleteByJobId,
};
