"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interviewService = require('../services/interview.service');
const { sendSuccess } = require('../utils/response');
const listMyInterviews = async (req, res) => {
    const result = await interviewService.listMyInterviews(req.user.id, req.user.role, req.query);
    return sendSuccess(res, {
        message: 'Interviews retrieved successfully',
        data: result.interviews,
        meta: result.meta,
    });
};
const getInterview = async (req, res) => {
    const interview = await interviewService.getInterview(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, {
        message: 'Interview retrieved successfully',
        data: interview,
    });
};
const createInterview = async (req, res) => {
    const interview = await interviewService.createInterview(req.user.id, req.user.role, req.body);
    return sendSuccess(res, {
        statusCode: 201,
        message: 'Interview scheduled successfully',
        data: interview,
    });
};
const updateInterview = async (req, res) => {
    const interview = await interviewService.updateInterview(req.params.id, req.user.id, req.user.role, req.body);
    return sendSuccess(res, {
        message: 'Interview updated successfully',
        data: interview,
    });
};
const cancelInterview = async (req, res) => {
    const interview = await interviewService.updateInterviewStatus(req.params.id, req.user.id, req.user.role, 'cancelled');
    return sendSuccess(res, {
        message: 'Interview cancelled successfully',
        data: interview,
    });
};
const completeInterview = async (req, res) => {
    const interview = await interviewService.updateInterviewStatus(req.params.id, req.user.id, req.user.role, 'completed');
    return sendSuccess(res, {
        message: 'Interview marked as completed',
        data: interview,
    });
};
const confirmInterview = async (req, res) => {
    const interview = await interviewService.updateInterviewStatus(req.params.id, req.user.id, req.user.role, 'confirmed');
    return sendSuccess(res, {
        message: 'Interview confirmed successfully',
        data: interview,
    });
};
const declineInterview = async (req, res) => {
    const interview = await interviewService.updateInterviewStatus(req.params.id, req.user.id, req.user.role, 'declined');
    return sendSuccess(res, {
        message: 'Interview declined successfully',
        data: interview,
    });
};
module.exports = {
    listMyInterviews,
    getInterview,
    createInterview,
    updateInterview,
    cancelInterview,
    completeInterview,
    confirmInterview,
    declineInterview,
};
