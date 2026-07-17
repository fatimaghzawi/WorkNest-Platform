"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Task = require('../models/Task').default;
require('../models/User').default;
require('../models/Job').default;
const CREATOR_POPULATE = {
    path: 'createdBy',
    select: 'firstName lastName email profileImage role',
};
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
const create = (data) => Task.create(data);
const findById = (id) => Task.findById(id).populate(CREATOR_POPULATE);
const findByJob = (jobId) => Task.find({ jobId }).sort({ createdAt: -1 }).populate(CREATOR_POPULATE);
const buildTaskFilter = ({ jobId, origin, priority, }) => {
    const filter = { jobId };
    if (origin === 'client' || origin === 'freelancer')
        filter.origin = origin;
    if (priority === 'low' || priority === 'medium' || priority === 'high') {
        filter.priority = priority;
    }
    return filter;
};
const findByJobPaginated = async ({ jobId, skip, limit, origin, priority, sortBy = 'createdAt', sortOrder = 'desc', }) => {
    const filter = buildTaskFilter({ jobId, origin, priority });
    const dir = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'priority' || sortBy === 'dueDate') {
        const rows = await Task.find(filter).populate(CREATOR_POPULATE).lean();
        rows.sort((a, b) => {
            if (sortBy === 'priority') {
                const rankA = PRIORITY_RANK[a.priority] ?? 1;
                const rankB = PRIORITY_RANK[b.priority] ?? 1;
                if (rankA !== rankB)
                    return (rankA - rankB) * dir;
            }
            else {
                if (!a.dueDate && !b.dueDate) {
                    /* continue */
                }
                else if (!a.dueDate)
                    return 1;
                else if (!b.dueDate)
                    return -1;
                else {
                    const delta = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    if (delta !== 0)
                        return delta * dir;
                }
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        return rows.slice(skip, skip + limit);
    }
    const sort = sortBy === 'title' ? { title: dir } : { createdAt: dir };
    return Task.find(filter).sort(sort).skip(skip).limit(limit).populate(CREATOR_POPULATE).lean();
};
const countByJob = (jobId, filters = {}) => Task.countDocuments(buildTaskFilter({ jobId, ...filters }));
const countDoneByJob = (jobId) => Task.countDocuments({ jobId, status: 'done' });
const getProgressByJobIds = async (jobIds) => {
    if (!jobIds.length)
        return {};
    const objectIds = jobIds.map((id) => new mongoose.Types.ObjectId(id));
    const rows = await Task.aggregate([
        { $match: { jobId: { $in: objectIds } } },
        {
            $group: {
                _id: '$jobId',
                total: { $sum: 1 },
                done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
            },
        },
    ]);
    return rows.reduce((acc, row) => {
        const total = row.total || 0;
        acc[row._id.toString()] = total === 0 ? 0 : Math.round((row.done / total) * 100);
        return acc;
    }, {});
};
const updateById = (id, data) => Task.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true }).populate(CREATOR_POPULATE);
const deleteById = (id) => Task.findByIdAndDelete(id);
const deleteByJobId = (jobId) => Task.deleteMany({ jobId });
const createMany = (items) => Task.insertMany(items);
const resetReviewTasksToInProgress = (jobId) => Task.updateMany({ jobId, status: 'review' }, { status: 'in_progress' });
const countNotDoneByJob = (jobId) => Task.countDocuments({ jobId, status: { $ne: 'done' } });
module.exports = {
    create,
    findById,
    findByJob,
    findByJobPaginated,
    countByJob,
    countDoneByJob,
    countNotDoneByJob,
    getProgressByJobIds,
    updateById,
    deleteById,
    deleteByJobId,
    createMany,
    resetReviewTasksToInProgress,
};
