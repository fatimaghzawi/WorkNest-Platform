"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const jobRepository = require('../repositories/job.repository');
const projectRepository = require('../repositories/project.repository');
const workspaceRepository = require('../repositories/workspace.repository');
const notificationTriggers = require('./notificationTriggers');
const paymentService = require('./payment.service');
const jobCleanupService = require('./jobCleanup.service');
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
        return 'User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
};
const toClientProject = (project, payment = null) => {
    const plain = project.toObject ? project.toObject() : project;
    const job = plain.jobId && typeof plain.jobId === 'object' ? plain.jobId : null;
    const client = plain.clientId && typeof plain.clientId === 'object' ? plain.clientId : null;
    const freelancer = plain.freelancerId && typeof plain.freelancerId === 'object' ? plain.freelancerId : null;
    return {
        _id: plain._id.toString(),
        id: plain._id.toString(),
        jobId: getId(plain.jobId),
        jobTitle: job?.title || plain.title,
        jobStatus: job?.status,
        jobBudget: job?.budget,
        jobDeadline: job?.deadline ? new Date(job.deadline).toISOString() : undefined,
        title: plain.title,
        status: plain.status,
        progress: plain.progress ?? 0,
        clientId: getId(plain.clientId),
        freelancerId: getId(plain.freelancerId),
        clientName: displayName(client),
        freelancerName: displayName(freelancer),
        githubLink: plain.githubLink || undefined,
        deliveryNotes: plain.deliveryNotes || undefined,
        reviewNotes: plain.reviewNotes || undefined,
        submittedAt: plain.submittedAt ? new Date(plain.submittedAt).toISOString() : undefined,
        createdAt: plain.createdAt ? new Date(plain.createdAt).toISOString() : undefined,
        payment: payment || undefined,
        contractAmount: payment?.amount,
        escrowStatus: payment?.status,
    };
};
const assertProjectAccess = (project, userId, userRole) => {
    const isClient = getId(project.clientId) === userId;
    const isFreelancer = getId(project.freelancerId) === userId;
    if (userRole === 'admin' || isClient || isFreelancer) {
        return { isClient, isFreelancer };
    }
    throw new AppError('You do not have access to this project', 403);
};
const getProjectById = async (id) => {
    const project = await projectRepository.findById(id);
    if (!project)
        throw new AppError('Project not found', 404);
    return project;
};
const ensureJobClosedForCompletedProject = async (clientProject) => {
    if (clientProject.status !== 'completed')
        return clientProject;
    const jobId = clientProject.jobId;
    if (!jobId)
        return clientProject;
    const job = await jobRepository.findById(jobId);
    if (job && job.status !== 'closed') {
        await jobRepository.updateById(jobId, { status: 'closed' });
    }
    return clientProject;
};
const attachTaskProgress = async (clientProjects) => {
    const jobIds = [...new Set(clientProjects.map((project) => project.jobId).filter(Boolean))];
    if (jobIds.length === 0)
        return clientProjects;
    const progressMap = await workspaceRepository.getProgressByJobIds(jobIds);
    const withProgress = clientProjects.map((project) => ({
        ...project,
        progress: progressMap[project.jobId] ?? project.progress ?? 0,
    }));
    return Promise.all(withProgress.map(ensureJobClosedForCompletedProject));
};
const listProjects = async (userId, userRole, query = {}) => {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};
    if (query.status)
        filter.status = query.status;
    if (userRole === 'client')
        filter.clientId = userId;
    else if (userRole === 'freelancer')
        filter.freelancerId = userId;
    const [projects, total] = await Promise.all([
        projectRepository.findAll({
            filter,
            skip,
            limit,
            sort: { createdAt: -1 },
        }),
        projectRepository.count(filter),
    ]);
    const paymentMap = await paymentService.mapPaymentsByProjectId(projects.map((project) => project._id.toString()));
    const withPayments = projects.map((project) => toClientProject(project, paymentMap.get(project._id.toString()) || null));
    return {
        projects: await attachTaskProgress(withPayments),
        meta: buildPaginationMeta(total, page, limit),
    };
};
const getProject = async (id, userId, userRole) => {
    const project = await projectRepository.findById(id);
    if (!project)
        throw new AppError('Project not found', 404);
    const isClient = getId(project.clientId) === userId;
    const isFreelancer = getId(project.freelancerId) === userId;
    if (userRole !== 'admin' && !isClient && !isFreelancer) {
        throw new AppError('You do not have access to this project', 403);
    }
    const payment = await paymentService.getPaymentByProject(id, userId, userRole);
    const [clientProject] = await attachTaskProgress([toClientProject(project, payment)]);
    return clientProject;
};
const getProjectStats = async (userRole) => {
    if (userRole !== 'admin') {
        throw new AppError('Only admins can view project stats', 403);
    }
    const [total, active, pendingReview, completed, cancelled] = await Promise.all([
        projectRepository.count({}),
        projectRepository.count({ status: 'active' }),
        projectRepository.count({ status: 'pending_review' }),
        projectRepository.count({ status: 'completed' }),
        projectRepository.count({ status: 'cancelled' }),
    ]);
    return { total, active, pendingReview, completed, cancelled };
};
const submitForReview = async (id, userId, userRole, data = {}) => {
    const project = await getProjectById(id);
    const { isFreelancer } = assertProjectAccess(project, userId, userRole);
    if (!isFreelancer && userRole !== 'admin') {
        throw new AppError('Only the assigned freelancer can submit a project for review', 403);
    }
    if (project.status !== 'active') {
        throw new AppError('Only active projects can be submitted for client review', 400);
    }
    const updated = await projectRepository.updateById(id, {
        status: 'pending_review',
        progress: 100,
        deliveryNotes: data.deliveryNotes?.trim() || undefined,
        reviewNotes: undefined,
        submittedAt: new Date(),
    });
    const [clientProject] = await attachTaskProgress([toClientProject(updated)]);
    await notificationTriggers.projectSubmittedForReview(updated);
    return clientProject;
};
const acceptProject = async (id, userId, userRole) => {
    const project = await getProjectById(id);
    const { isClient } = assertProjectAccess(project, userId, userRole);
    if (!isClient && userRole !== 'admin') {
        throw new AppError('Only the client can accept project delivery', 403);
    }
    if (project.status !== 'pending_review') {
        throw new AppError('Only projects awaiting review can be accepted', 400);
    }
    const updated = await projectRepository.updateById(id, {
        status: 'completed',
        progress: 100,
        reviewNotes: undefined,
    });
    const jobId = getId(project.jobId);
    if (jobId) {
        await jobRepository.updateById(jobId, { status: 'closed' });
    }
    await paymentService.releaseEscrow(id);
    const payment = await paymentService.getPaymentByProject(id, userId, userRole);
    const [clientProject] = await attachTaskProgress([toClientProject(updated, payment)]);
    await notificationTriggers.projectAccepted(updated);
    return clientProject;
};
const requestRevision = async (id, userId, userRole, data) => {
    const project = await getProjectById(id);
    const { isClient } = assertProjectAccess(project, userId, userRole);
    if (!isClient && userRole !== 'admin') {
        throw new AppError('Only the client can request revisions', 403);
    }
    if (project.status !== 'pending_review') {
        throw new AppError('Only projects awaiting review can be sent back for revisions', 400);
    }
    const updated = await projectRepository.updateById(id, {
        status: 'active',
        reviewNotes: data.reviewNotes.trim(),
        submittedAt: undefined,
    });
    const jobId = getId(project.jobId);
    if (jobId) {
        await jobRepository.updateById(jobId, { status: 'in_progress' });
    }
    const [clientProject] = await attachTaskProgress([toClientProject(updated)]);
    await notificationTriggers.projectRevisionRequested(updated, data.reviewNotes);
    return clientProject;
};
const cancelProject = async (id, userId, userRole, data = {}) => {
    const project = await getProjectById(id);
    const { isClient } = assertProjectAccess(project, userId, userRole);
    if (!isClient && userRole !== 'admin') {
        throw new AppError('Only the client can cancel a project', 403);
    }
    if (project.status === 'completed') {
        throw new AppError('Completed projects cannot be cancelled', 400);
    }
    if (project.status === 'cancelled') {
        const payment = await paymentService.getPaymentByProject(id, userId, userRole);
        const [clientProject] = await attachTaskProgress([toClientProject(project, payment)]);
        return clientProject;
    }
    await paymentService.refundEscrow(id);
    const jobId = getId(project.jobId);
    if (jobId) {
        await jobCleanupService.cancelJobInterviews(jobId);
        await jobRepository.updateById(jobId, { status: 'closed' });
    }
    const updated = await projectRepository.updateById(id, {
        status: 'cancelled',
        reviewNotes: data.reason?.trim() || undefined,
        submittedAt: undefined,
    });
    const payment = await paymentService.getPaymentByProject(id, userId, userRole);
    const [clientProject] = await attachTaskProgress([toClientProject(updated, payment)]);
    await notificationTriggers.projectCancelled(updated, data.reason?.trim());
    return clientProject;
};
module.exports = {
    listProjects,
    getProject,
    getProjectStats,
    submitForReview,
    acceptProject,
    requestRevision,
    cancelProject,
    toClientProject,
};
