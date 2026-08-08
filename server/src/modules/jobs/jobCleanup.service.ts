const proposalRepository = require('../proposals/proposal.repository');
const interviewRepository = require('../interviews/interview.repository');
const workspaceRepository = require('../workspace/workspace.repository');
const workspaceAttachmentRepository = require('../workspace/workspaceAttachment.repository');
const projectRepository = require('../projects/project.repository');
const paymentRepository = require('../payments/payment.repository');

const deleteOpenJobRelatedData = async (jobId: string) => {
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

const cancelJobInterviews = async (jobId: string) => {
  await interviewRepository.cancelActiveByJobId(jobId);
};

module.exports = {
  deleteOpenJobRelatedData,
  cancelJobInterviews,
};
