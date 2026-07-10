"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const proposalRepository = require('../repositories/proposal.repository');
const interviewRepository = require('../repositories/interview.repository');
const workspaceRepository = require('../repositories/workspace.repository');
const workspaceAttachmentRepository = require('../repositories/workspaceAttachment.repository');
const projectRepository = require('../repositories/project.repository');
const paymentRepository = require('../repositories/payment.repository');
const deleteOpenJobRelatedData = async (jobId) => {
    const project = await projectRepository.findByJobId(jobId);
    await Promise.all([
        proposalRepository.deleteByJobId(jobId),
        interviewRepository.deleteByJobId(jobId),
        workspaceRepository.deleteByJobId(jobId),
        workspaceAttachmentRepository.deleteByJobId(jobId),
        project ? paymentRepository.deleteByProjectId(project._id.toString()) : Promise.resolve(),
        project ? projectRepository.deleteById(project._id.toString()) : Promise.resolve(),
    ]);
};
const cancelJobInterviews = async (jobId) => {
    await interviewRepository.cancelActiveByJobId(jobId);
};
module.exports = {
    deleteOpenJobRelatedData,
    cancelJobInterviews,
};
