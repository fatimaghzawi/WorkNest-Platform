"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Payment = require('../models/Payment').default;
const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));
const create = (data) => Payment.create(data);
const findById = (id) => Payment.findById(id).lean();
const findByProjectId = (projectId) => Payment.findOne({ projectId }).lean();
const findByProjectIds = (projectIds) => Payment.find({ projectId: { $in: projectIds } }).lean();
const updateById = (id, data) => Payment.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true }).lean();
const updateByProjectId = (projectId, data) => Payment.findOneAndUpdate({ projectId }, data, {
    returnDocument: 'after',
    runValidators: true,
}).lean();
const deleteByProjectId = (projectId) => Payment.deleteOne({ projectId });
const deleteByJobId = (jobId) => Payment.deleteMany({ jobId });
const findForUser = ({ userId, role, status, skip, limit }) => {
    const filter = {};
    if (role === 'client')
        filter.clientId = userId;
    else if (role === 'freelancer')
        filter.freelancerId = userId;
    if (status)
        filter.status = status;
    return Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
};
const countForUser = (userId, role, status) => {
    const filter = {};
    if (role === 'client')
        filter.clientId = userId;
    else if (role === 'freelancer')
        filter.freelancerId = userId;
    if (status)
        filter.status = status;
    return Payment.countDocuments(filter);
};
const sumForUser = async (userId, role, status) => {
    const match = { status };
    if (role === 'client')
        match.clientId = toObjectId(userId);
    else if (role === 'freelancer')
        match.freelancerId = toObjectId(userId);
    const amountField = role === 'freelancer' && status === 'released'
        ? { $ifNull: ['$freelancerPayout', '$amount'] }
        : '$amount';
    const rows = await Payment.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: amountField } } },
    ]);
    return rows[0]?.total || 0;
};
const sumPlatformFees = async (status = 'released', since) => {
    const match = { status };
    if (since)
        match.releasedAt = { $gte: since };
    const rows = await Payment.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                total: { $sum: { $ifNull: ['$platformFee', 0] } },
            },
        },
    ]);
    return rows[0]?.total || 0;
};
const findReleasedWithFees = ({ skip, limit }) => Payment.find({ status: 'released', platformFee: { $gt: 0 } })
    .sort({ releasedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
const countReleasedWithFees = () => Payment.countDocuments({ status: 'released', platformFee: { $gt: 0 } });
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
    sumPlatformFees,
    findReleasedWithFees,
    countReleasedWithFees,
};
