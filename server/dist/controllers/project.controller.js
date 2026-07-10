"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const projectService = require('../services/project.service');
const { sendSuccess } = require('../utils/response');
const listProjects = async (req, res) => {
    const result = await projectService.listProjects(req.user.id, req.user.role, req.query);
    return sendSuccess(res, {
        message: 'Projects retrieved successfully',
        data: result.projects,
        meta: result.meta,
    });
};
const getProject = async (req, res) => {
    const project = await projectService.getProject(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, {
        message: 'Project retrieved successfully',
        data: project,
    });
};
const getProjectStats = async (req, res) => {
    const stats = await projectService.getProjectStats(req.user.role);
    return sendSuccess(res, {
        message: 'Project stats retrieved successfully',
        data: stats,
    });
};
const submitForReview = async (req, res) => {
    const project = await projectService.submitForReview(req.params.id, req.user.id, req.user.role, req.body);
    return sendSuccess(res, {
        message: 'Project submitted for client review',
        data: project,
    });
};
const acceptProject = async (req, res) => {
    const project = await projectService.acceptProject(req.params.id, req.user.id, req.user.role);
    return sendSuccess(res, {
        message: 'Project marked as completed',
        data: project,
    });
};
const requestRevision = async (req, res) => {
    const project = await projectService.requestRevision(req.params.id, req.user.id, req.user.role, req.body);
    return sendSuccess(res, {
        message: 'Revision requested. The freelancer can continue in the workspace.',
        data: project,
    });
};
const cancelProject = async (req, res) => {
    const project = await projectService.cancelProject(req.params.id, req.user.id, req.user.role, req.body);
    return sendSuccess(res, {
        message: 'Project cancelled successfully',
        data: project,
    });
};
module.exports = {
    listProjects,
    getProject,
    getProjectStats,
    submitForReview,
    acceptProject,
    requestRevision,
    cancelProject,
};
