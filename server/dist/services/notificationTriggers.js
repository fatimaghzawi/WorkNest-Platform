"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notificationService = require('./notification.service');
const eventEmailService = require('./email/eventEmail.service');
const proposalRepository = require('../repositories/proposal.repository');
const projectRepository = require('../repositories/project.repository');
const jobRepository = require('../repositories/job.repository');
const getId = (value) => {
    if (!value)
        return '';
    if (typeof value === 'string')
        return value;
    if (value._id)
        return value._id.toString();
    return value.toString();
};
const displayName = (user) => {
    if (!user || typeof user === 'string')
        return 'Someone';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Someone';
};
const notify = (data) => notificationService.notifySafe(() => notificationService.createAndNotify(data));
const dispatch = async (data) => {
    await notify(data);
    void eventEmailService.sendSafe(data);
};
const proposalSubmitted = async (proposal) => {
    const job = proposal.jobId;
    const freelancer = proposal.freelancerId;
    const clientId = getId(job?.clientId);
    if (!clientId)
        return;
    await dispatch({
        recipientId: clientId,
        type: 'proposal.submitted',
        title: 'New proposal received',
        message: `${displayName(freelancer)} submitted a proposal for "${job?.title || 'your job'}".`,
        relatedJobId: getId(job?._id || job),
        relatedProposalId: getId(proposal._id),
    });
};
const proposalUpdated = async (proposal) => {
    const job = proposal.jobId;
    const freelancer = proposal.freelancerId;
    const clientId = getId(job?.clientId);
    if (!clientId)
        return;
    await dispatch({
        recipientId: clientId,
        type: 'proposal.updated',
        title: 'Proposal updated',
        message: `${displayName(freelancer)} updated their proposal for "${job?.title || 'your job'}".`,
        relatedJobId: getId(job?._id || job),
        relatedProposalId: getId(proposal._id),
    });
};
const proposalWithdrawn = async (proposal) => {
    const job = proposal.jobId;
    const freelancer = proposal.freelancerId;
    const clientId = getId(job?.clientId);
    if (!clientId)
        return;
    await dispatch({
        recipientId: clientId,
        type: 'proposal.withdrawn',
        title: 'Proposal withdrawn',
        message: `${displayName(freelancer)} withdrew their proposal for "${job?.title || 'your job'}".`,
        relatedJobId: getId(job?._id || job),
        relatedProposalId: getId(proposal._id),
    });
};
const proposalAccepted = async (proposal, job, project) => {
    const freelancerId = getId(proposal.freelancerId);
    const jobTitle = job?.title || 'the job';
    const projectId = getId(project?._id);
    await dispatch({
        recipientId: freelancerId,
        type: 'proposal.accepted',
        title: 'Proposal accepted',
        message: `Your proposal for "${jobTitle}" was accepted. The workspace is now open.`,
        relatedJobId: getId(job?._id || job),
        relatedProposalId: getId(proposal._id),
        relatedProjectId: projectId || undefined,
    });
    const clientId = getId(job?.clientId);
    if (clientId) {
        await dispatch({
            recipientId: clientId,
            type: 'project.started',
            title: 'Project started',
            message: `You accepted ${displayName(proposal.freelancerId)} for "${jobTitle}". Collaboration can begin in the workspace.`,
            relatedJobId: getId(job?._id || job),
            relatedProposalId: getId(proposal._id),
            relatedProjectId: projectId || undefined,
        });
    }
};
const proposalRejected = async (proposal) => {
    const job = proposal.jobId;
    await dispatch({
        recipientId: getId(proposal.freelancerId),
        type: 'proposal.rejected',
        title: 'Proposal not selected',
        message: `Your proposal for "${job?.title || 'a job'}" was not accepted.`,
        relatedJobId: getId(job?._id || job),
        relatedProposalId: getId(proposal._id),
    });
};
const notifyOtherProposalsRejected = async (jobId, exceptProposalId, jobTitle) => {
    const pending = await proposalRepository.findPendingByJobExcept(jobId, exceptProposalId);
    await Promise.all(pending.map((row) => dispatch({
        recipientId: getId(row.freelancerId),
        type: 'proposal.rejected',
        title: 'Proposal not selected',
        message: `Another freelancer was chosen for "${jobTitle}".`,
        relatedJobId: jobId,
        relatedProposalId: getId(row._id),
    })));
};
const projectSubmittedForReview = async (project) => {
    const jobTitle = project.jobId?.title || project.title || 'your project';
    await dispatch({
        recipientId: getId(project.clientId),
        type: 'project.submitted_for_review',
        title: 'Delivery submitted for review',
        message: `${displayName(project.freelancerId)} submitted "${jobTitle}" for your review.`,
        relatedJobId: getId(project.jobId),
        relatedProjectId: getId(project._id),
    });
};
const projectAccepted = async (project) => {
    const jobTitle = project.jobId?.title || project.title || 'the project';
    await dispatch({
        recipientId: getId(project.freelancerId),
        type: 'project.accepted',
        title: 'Project completed',
        message: `The client accepted your delivery for "${jobTitle}". Great work!`,
        relatedJobId: getId(project.jobId),
        relatedProjectId: getId(project._id),
    });
};
const projectRevisionRequested = async (project, reviewNotes) => {
    const jobTitle = project.jobId?.title || project.title || 'the project';
    const suffix = reviewNotes ? ` Notes: ${reviewNotes}` : '';
    await dispatch({
        recipientId: getId(project.freelancerId),
        type: 'project.revision_requested',
        title: 'Revisions requested',
        message: `The client requested revisions on "${jobTitle}".${suffix}`,
        relatedJobId: getId(project.jobId),
        relatedProjectId: getId(project._id),
    });
};
const projectCancelled = async (project, reason) => {
    const jobTitle = project.jobId?.title || project.title || 'the project';
    const suffix = reason ? ` Reason: ${reason}` : '';
    await Promise.all([
        dispatch({
            recipientId: getId(project.freelancerId),
            type: 'project.cancelled',
            title: 'Project cancelled',
            message: `The client cancelled "${jobTitle}".${suffix}`,
            relatedJobId: getId(project.jobId),
            relatedProjectId: getId(project._id),
        }),
        dispatch({
            recipientId: getId(project.clientId),
            type: 'project.cancelled',
            title: 'Project cancelled',
            message: `"${jobTitle}" was cancelled.${suffix}`,
            relatedJobId: getId(project.jobId),
            relatedProjectId: getId(project._id),
        }),
    ]);
};
const getWorkspaceParties = async (jobId) => {
    const project = await projectRepository.findByJobIdPopulated(jobId);
    if (project) {
        return {
            clientId: getId(project.clientId),
            freelancerId: getId(project.freelancerId),
            jobTitle: project.jobId?.title || project.title || 'Project',
            projectId: getId(project._id),
        };
    }
    const job = await jobRepository.findById(jobId);
    const accepted = await proposalRepository.findAcceptedByJob(jobId);
    return {
        clientId: getId(job?.clientId),
        freelancerId: getId(accepted?.freelancerId),
        jobTitle: job?.title || 'Project',
        projectId: undefined,
    };
};
const notifyWorkspaceOtherParty = async (jobId, actorId, { type, title, message }) => {
    const parties = await getWorkspaceParties(jobId);
    const recipientId = parties.clientId === actorId ? parties.freelancerId : parties.clientId;
    if (!recipientId || recipientId === actorId)
        return;
    await dispatch({
        recipientId,
        type,
        title,
        message,
        relatedJobId: jobId,
        relatedProjectId: parties.projectId,
    });
};
const workspaceTaskCreated = async (jobId, actorId, taskTitle) => {
    await notifyWorkspaceOtherParty(jobId, actorId, {
        type: 'workspace.task_created',
        title: 'New workspace task',
        message: `A new task "${taskTitle}" was added to the project board.`,
    });
};
const workspaceTaskUpdated = async (jobId, actorId, taskTitle, status) => {
    const statusNote = status ? ` (now ${status.replace('_', ' ')})` : '';
    await notifyWorkspaceOtherParty(jobId, actorId, {
        type: 'workspace.task_updated',
        title: 'Workspace task updated',
        message: `Task "${taskTitle}" was updated${statusNote}.`,
    });
};
const workspaceAttachmentUploaded = async (jobId, actorId, fileName, uploaderName) => {
    const parties = await getWorkspaceParties(jobId);
    if (!parties.clientId || parties.clientId === actorId)
        return;
    await dispatch({
        recipientId: parties.clientId,
        type: 'workspace.attachment_uploaded',
        title: 'New workspace file',
        message: `${uploaderName} uploaded "${fileName}" to the project workspace.`,
        relatedJobId: jobId,
        relatedProjectId: parties.projectId,
    });
};
const interviewScheduled = async (interview) => {
    await dispatch({
        recipientId: getId(interview.freelancerId),
        type: 'interview.scheduled',
        title: 'Interview scheduled',
        message: `${displayName(interview.clientId)} scheduled an interview for "${interview.jobId?.title || 'a job'}".`,
        relatedJobId: getId(interview.jobId),
        relatedProposalId: getId(interview.proposalId),
    });
};
const interviewUpdated = async (interview, actorId) => {
    const recipientId = getId(interview.clientId) === actorId
        ? getId(interview.freelancerId)
        : getId(interview.clientId);
    await dispatch({
        recipientId,
        type: 'interview.updated',
        title: 'Interview updated',
        message: `Interview details were updated for "${interview.jobId?.title || 'your job'}".`,
        relatedJobId: getId(interview.jobId),
        relatedProposalId: getId(interview.proposalId),
    });
};
const interviewStatusChanged = async (interview, status, actorId) => {
    const recipientId = getId(interview.clientId) === actorId
        ? getId(interview.freelancerId)
        : getId(interview.clientId);
    const labels = {
        confirmed: {
            title: 'Interview confirmed',
            message: `${displayName(interview.freelancerId)} confirmed the interview.`,
        },
        declined: {
            title: 'Interview declined',
            message: `${displayName(interview.freelancerId)} declined the interview.`,
        },
        cancelled: {
            title: 'Interview cancelled',
            message: `${displayName(interview.clientId)} cancelled the interview.`,
        },
        completed: {
            title: 'Interview completed',
            message: `The interview for "${interview.jobId?.title || 'your job'}" was marked completed.`,
        },
    };
    const copy = labels[status];
    if (!copy)
        return;
    await dispatch({
        recipientId,
        type: `interview.${status}`,
        title: copy.title,
        message: copy.message,
        relatedJobId: getId(interview.jobId),
        relatedProposalId: getId(interview.proposalId),
    });
};
const paymentDeposited = async (payment, project) => {
    const title = project?.title || 'your project';
    await dispatch({
        recipientId: getId(payment.freelancerId),
        type: 'payment.deposited',
        title: 'Escrow funded',
        message: `The client deposited $${payment.amount} into escrow for "${title}". You can start working in the workspace.`,
        relatedJobId: getId(payment.jobId),
        relatedProjectId: getId(payment.projectId),
        relatedPaymentId: getId(payment._id),
    });
};
const paymentReleased = async (payment, project) => {
    const title = project?.title || 'the project';
    const freelancerAmount = payment.freelancerPayout ?? payment.amount;
    const platformFee = payment.platformFee ?? 0;
    const User = require('../models/User').default;
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id').lean();
    await Promise.all([
        dispatch({
            recipientId: getId(payment.freelancerId),
            type: 'payment.released',
            title: 'Payout released',
            message: `$${freelancerAmount} was released to your wallet for "${title}".`,
            relatedJobId: getId(payment.jobId),
            relatedProjectId: getId(payment.projectId),
            relatedPaymentId: getId(payment._id),
        }),
        dispatch({
            recipientId: getId(payment.clientId),
            type: 'payment.completed',
            title: 'Escrow released',
            message: `Funds for "${title}" were released to the freelancer after project completion.`,
            relatedJobId: getId(payment.jobId),
            relatedProjectId: getId(payment.projectId),
            relatedPaymentId: getId(payment._id),
        }),
        ...admins.map((admin) => dispatch({
            recipientId: getId(admin._id),
            type: 'payment.platform_fee',
            title: 'Platform profit earned',
            message: `$${platformFee} platform fee (${payment.budgetRangeLabel || 'commission'}) was credited from "${title}".`,
            relatedJobId: getId(payment.jobId),
            relatedProjectId: getId(payment.projectId),
            relatedPaymentId: getId(payment._id),
        })),
    ]);
};
const paymentRefunded = async (payment, project) => {
    const title = project?.title || 'your project';
    await dispatch({
        recipientId: getId(payment.clientId),
        type: 'payment.refunded',
        title: 'Escrow refunded',
        message: `$${payment.amount} was refunded for "${title}".`,
        relatedJobId: getId(payment.jobId),
        relatedProjectId: getId(payment.projectId),
        relatedPaymentId: getId(payment._id),
    });
};
module.exports = {
    proposalSubmitted,
    proposalUpdated,
    proposalWithdrawn,
    proposalAccepted,
    proposalRejected,
    notifyOtherProposalsRejected,
    projectSubmittedForReview,
    projectAccepted,
    projectRevisionRequested,
    projectCancelled,
    workspaceTaskCreated,
    workspaceTaskUpdated,
    workspaceAttachmentUploaded,
    interviewScheduled,
    interviewUpdated,
    interviewStatusChanged,
    paymentDeposited,
    paymentReleased,
    paymentRefunded,
};
