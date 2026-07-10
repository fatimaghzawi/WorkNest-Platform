"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const proposalService = require('../services/proposal.service');
const { sendSuccess } = require('../utils/response');
const createProposal = async (req, res) => {
    const proposal = await proposalService.createProposal(req.user.id, req.body);
    return sendSuccess(res, {
        statusCode: 201,
        message: 'Proposal submitted successfully',
        data: proposal,
    });
};
const getMyProposals = async (req, res) => {
    const result = await proposalService.getMyProposals(req.user.id, req.query);
    return sendSuccess(res, {
        message: 'Your proposals retrieved successfully',
        data: result.proposals,
        meta: result.meta,
    });
};
const getProposalsByJob = async (req, res) => {
    const result = await proposalService.getProposalsByJob(req.params.jobId, req.user.id, req.query, req.user.role);
    return sendSuccess(res, {
        message: 'Job proposals retrieved successfully',
        data: result.proposals,
        meta: result.meta,
    });
};
const getProposal = async (req, res) => {
    const proposal = await proposalService.getProposal(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, {
        message: 'Proposal retrieved successfully',
        data: proposal,
    });
};
const updateProposal = async (req, res) => {
    const proposal = await proposalService.updateProposal(req.params.id, req.user.id, req.body);
    return sendSuccess(res, {
        message: 'Proposal updated successfully',
        data: proposal,
    });
};
const updateProposalStatus = async (req, res) => {
    const proposal = await proposalService.updateProposalStatus(req.params.id, req.user.id, req.body.status, req.user.role);
    return sendSuccess(res, {
        message: `Proposal ${req.body.status} successfully`,
        data: proposal,
    });
};
const withdrawProposal = async (req, res) => {
    await proposalService.withdrawProposal(req.params.id, req.user.id);
    return sendSuccess(res, {
        message: 'Proposal withdrawn successfully',
    });
};
const listAllProposals = async (req, res) => {
    const result = await proposalService.listAllProposals(req.query);
    return sendSuccess(res, {
        message: 'Proposals retrieved successfully',
        data: result.proposals,
        meta: result.meta,
    });
};
const getProposalStats = async (req, res) => {
    const stats = await proposalService.getProposalStats();
    return sendSuccess(res, {
        message: 'Proposal stats retrieved successfully',
        data: stats,
    });
};
module.exports = {
    createProposal,
    getMyProposals,
    getProposalsByJob,
    listAllProposals,
    getProposal,
    updateProposal,
    updateProposalStatus,
    withdrawProposal,
    getProposalStats,
};
