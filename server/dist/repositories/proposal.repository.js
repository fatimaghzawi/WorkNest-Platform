"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Proposal = require('../models/Proposal').default;
const mongoose = require('mongoose');
require('../models/User').default;
require('../models/Job').default;
const FREELANCER_POPULATE = {
    path: 'freelancerId',
    select: 'firstName lastName email profileImage skills bio portfolioLink',
};
const JOB_POPULATE = {
    path: 'jobId',
    select: 'title status budget category clientId deadline',
    populate: { path: 'clientId', select: 'firstName lastName email' },
};
const create = (data) => Proposal.create(data);
const findById = (id) => Proposal.findById(id).populate(FREELANCER_POPULATE).populate(JOB_POPULATE);
const findByJobAndFreelancer = (jobId, freelancerId) => Proposal.findOne({ jobId, freelancerId });
const findAcceptedByJob = (jobId) => Proposal.findOne({ jobId, status: 'accepted' }).populate(FREELANCER_POPULATE);
const hasAcceptedWithClient = async (clientId, freelancerId) => {
    const result = await Proposal.aggregate([
        {
            $match: {
                freelancerId: new mongoose.Types.ObjectId(freelancerId),
                status: 'accepted',
            },
        },
        {
            $lookup: {
                from: 'jobs',
                localField: 'jobId',
                foreignField: '_id',
                as: 'job',
            },
        },
        { $unwind: '$job' },
        {
            $match: {
                'job.clientId': new mongoose.Types.ObjectId(clientId),
            },
        },
        { $limit: 1 },
    ]);
    return result.length > 0;
};
const findAll = ({ filter, skip, limit, sort }) => Proposal.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate(FREELANCER_POPULATE)
    .populate(JOB_POPULATE);
const count = (filter) => Proposal.countDocuments(filter);
const updateById = (id, data) => Proposal.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true })
    .populate(FREELANCER_POPULATE)
    .populate(JOB_POPULATE);
const deleteById = (id) => Proposal.findByIdAndDelete(id);
const deleteByJobId = (jobId) => Proposal.deleteMany({ jobId });
const rejectPendingByJobExcept = (jobId, exceptProposalId) => Proposal.updateMany({ jobId, _id: { $ne: exceptProposalId }, status: 'pending' }, { status: 'rejected' });
const findPendingByJobExcept = (jobId, exceptProposalId) => Proposal.find({ jobId, _id: { $ne: exceptProposalId }, status: 'pending' }).select('freelancerId');
module.exports = {
    create,
    findById,
    findByJobAndFreelancer,
    findAcceptedByJob,
    hasAcceptedWithClient,
    findAll,
    count,
    updateById,
    deleteById,
    deleteByJobId,
    rejectPendingByJobExcept,
    findPendingByJobExcept,
};
