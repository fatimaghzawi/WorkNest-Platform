"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const proposalRepository = require('../repositories/proposal.repository');
const jobRepository = require('../repositories/job.repository');
const projectRepository = require('../repositories/project.repository');
const notificationTriggers = require('./notificationTriggers');
const paymentService = require('./payment.service');
const getId = (value) => {
    if (!value)
        return '';
    if (typeof value === 'string')
        return value;
    if (value._id)
        return value._id.toString();
    return value.toString();
};
const buildProposalFilter = (query = {}, baseFilter = {}) => {
    const filter = { ...baseFilter };
    if (query.status) {
        filter.status = query.status;
    }
    return filter;
};
const listProposals = async (filter, query = {}) => {
    const { page, limit, skip } = parsePagination(query);
    const proposalFilter = buildProposalFilter(query, filter);
    const [proposals, total] = await Promise.all([
        proposalRepository.findAll({
            filter: proposalFilter,
            skip,
            limit,
            sort: { createdAt: -1 },
        }),
        proposalRepository.count(proposalFilter),
    ]);
    return {
        proposals,
        meta: buildPaginationMeta(total, page, limit),
    };
};
const getProposalById = async (id) => {
    const proposal = await proposalRepository.findById(id);
    if (!proposal) {
        throw new AppError('Proposal not found', 404);
    }
    return proposal;
};
const assertProposalAccess = (proposal, userId, userRole) => {
    const isFreelancerOwner = proposal.freelancerId._id
        ? proposal.freelancerId._id.toString() === userId
        : proposal.freelancerId.toString() === userId;
    const jobClientId = proposal.jobId.clientId._id
        ? proposal.jobId.clientId._id.toString()
        : proposal.jobId.clientId.toString();
    const isJobOwner = jobClientId === userId;
    if (userRole === 'admin' || isFreelancerOwner || isJobOwner) {
        return;
    }
    throw new AppError('You do not have access to this proposal', 403);
};
const createProposal = async (freelancerId, data) => {
    const job = await jobRepository.findById(data.jobId);
    if (!job) {
        throw new AppError('Job not found', 404);
    }
    if (job.status !== 'open') {
        throw new AppError('Proposals can only be submitted for open jobs', 400);
    }
    if (job.clientId.toString() === freelancerId) {
        throw new AppError('You cannot submit a proposal to your own job', 400);
    }
    const existingProposal = await proposalRepository.findByJobAndFreelancer(data.jobId, freelancerId);
    if (existingProposal) {
        throw new AppError('You have already submitted a proposal for this job', 409);
    }
    try {
        const proposal = await proposalRepository.create({
            ...data,
            freelancerId,
        });
        const populated = await proposalRepository.findById(proposal._id.toString());
        await notificationTriggers.proposalSubmitted(populated);
        return populated;
    }
    catch (error) {
        if (error.code === 11000) {
            throw new AppError('You have already submitted a proposal for this job', 409);
        }
        throw error;
    }
};
const updateProposal = async (id, freelancerId, data) => {
    const proposal = await proposalRepository.findById(id);
    if (!proposal) {
        throw new AppError('Proposal not found', 404);
    }
    if (proposal.freelancerId._id.toString() !== freelancerId) {
        throw new AppError('You can only update your own proposals', 403);
    }
    if (proposal.status !== 'pending') {
        throw new AppError('Only pending proposals can be updated', 400);
    }
    const job = await jobRepository.findById(proposal.jobId._id.toString());
    if (!job || job.status !== 'open') {
        throw new AppError('Proposals can only be updated while the job is open', 400);
    }
    const updated = await proposalRepository.updateById(id, data);
    if (!updated) {
        throw new AppError('Proposal not found', 404);
    }
    await notificationTriggers.proposalUpdated(updated);
    return updated;
};
const updateProposalStatus = async (id, userId, status, userRole = 'client') => {
    const proposal = await proposalRepository.findById(id);
    if (!proposal) {
        throw new AppError('Proposal not found', 404);
    }
    const job = await jobRepository.findById(proposal.jobId._id.toString());
    if (!job) {
        throw new AppError('Job not found', 404);
    }
    if (userRole !== 'admin' && job.clientId.toString() !== userId) {
        throw new AppError('You can only manage proposals for your own jobs', 403);
    }
    if (proposal.status !== 'pending') {
        throw new AppError('Only pending proposals can be updated', 400);
    }
    if (status === 'accepted') {
        if (job.status !== 'open') {
            throw new AppError('Only open jobs can accept proposals', 400);
        }
        const updated = await proposalRepository.updateById(id, { status: 'accepted' });
        const project = await projectRepository.findOrCreateFromAcceptance({
            jobId: job._id.toString(),
            clientId: getId(job.clientId),
            freelancerId: getId(proposal.freelancerId),
            title: job.title,
        });
        await notificationTriggers.notifyOtherProposalsRejected(job._id.toString(), id, job.title);
        await Promise.all([
            proposalRepository.rejectPendingByJobExcept(job._id.toString(), id),
            jobRepository.updateById(job._id.toString(), { status: 'in_progress' }),
        ]);
        await paymentService.createPendingEscrow({
            projectId: project._id.toString(),
            jobId: job._id.toString(),
            proposalId: id,
            clientId: getId(job.clientId),
            freelancerId: getId(proposal.freelancerId),
            amount: proposal.price,
        });
        await notificationTriggers.proposalAccepted(updated, job, project);
        return updated;
    }
    const updated = await proposalRepository.updateById(id, { status: 'rejected' });
    if (!updated) {
        throw new AppError('Proposal not found', 404);
    }
    await notificationTriggers.proposalRejected(updated);
    return updated;
};
const withdrawProposal = async (id, freelancerId) => {
    const proposal = await proposalRepository.findById(id);
    if (!proposal) {
        throw new AppError('Proposal not found', 404);
    }
    if (proposal.freelancerId._id.toString() !== freelancerId) {
        throw new AppError('You can only withdraw your own proposals', 403);
    }
    if (proposal.status !== 'pending') {
        throw new AppError('Only pending proposals can be withdrawn', 400);
    }
    await notificationTriggers.proposalWithdrawn(proposal);
    await proposalRepository.deleteById(id);
};
const getMyProposals = async (freelancerId, query = {}) => {
    return listProposals({ freelancerId }, query);
};
const getProposalsByJob = async (jobId, userId, query = {}, userRole = 'client') => {
    const job = await jobRepository.findById(jobId);
    if (!job) {
        throw new AppError('Job not found', 404);
    }
    if (userRole !== 'admin' && job.clientId.toString() !== userId) {
        throw new AppError('You can only view proposals for your own jobs', 403);
    }
    return listProposals({ jobId }, query);
};
const listAllProposals = async (query = {}) => {
    return listProposals({}, query);
};
const getProposalStats = async () => {
    const [total, pending, accepted, rejected] = await Promise.all([
        proposalRepository.count({}),
        proposalRepository.count({ status: 'pending' }),
        proposalRepository.count({ status: 'accepted' }),
        proposalRepository.count({ status: 'rejected' }),
    ]);
    return { total, pending, accepted, rejected };
};
const getProposal = async (id, userId, userRole) => {
    const proposal = await getProposalById(id);
    assertProposalAccess(proposal, userId, userRole);
    return proposal;
};
module.exports = {
    createProposal,
    updateProposal,
    updateProposalStatus,
    withdrawProposal,
    getMyProposals,
    getProposalsByJob,
    getProposal,
    listAllProposals,
    getProposalStats,
};
