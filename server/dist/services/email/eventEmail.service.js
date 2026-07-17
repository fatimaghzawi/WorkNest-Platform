"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env = require('../../config/env');
const userRepository = require('../../repositories/user.repository');
const emailService = require('./email.service');
const getId = (value) => {
    if (!value)
        return '';
    if (typeof value === 'string')
        return value;
    if (value._id)
        return value._id.toString();
    return value.toString();
};
const ACTION_LABELS = {
    'proposal.submitted': 'Review proposal',
    'proposal.updated': 'View proposal',
    'proposal.withdrawn': 'View job',
    'proposal.accepted': 'Open workspace',
    'proposal.rejected': 'Browse jobs',
    'project.started': 'Open workspace',
    'project.submitted_for_review': 'Review delivery',
    'project.accepted': 'View projects',
    'project.revision_requested': 'Open workspace',
    'project.cancelled': 'View projects',
    'payment.deposited': 'Open workspace',
    'payment.released': 'View wallet',
    'payment.completed': 'View payments',
    'payment.refunded': 'View payments',
    'payment.platform_fee': 'View platform wallet',
    'interview.scheduled': 'View interview',
    'interview.updated': 'View interview',
    'interview.confirmed': 'View interview',
    'interview.declined': 'View interview',
    'interview.cancelled': 'View interview',
    'interview.completed': 'View interview',
    'workspace.task_created': 'Open workspace',
    'workspace.task_updated': 'Open workspace',
    'workspace.attachment_uploaded': 'Open workspace',
};
const dashboardBase = (role) => {
    if (role === 'admin')
        return `${env.clientUrl}/admin`;
    if (role === 'freelancer')
        return `${env.clientUrl}/freelancer`;
    return `${env.clientUrl}/client`;
};
const buildActionUrl = (type, role, { relatedJobId, relatedProjectId, relatedProposalId, } = {}) => {
    const base = dashboardBase(role);
    if (type.startsWith('payment.')) {
        if (type === 'payment.platform_fee')
            return `${base}/wallet`;
        if (role === 'freelancer')
            return `${base}/wallet`;
        return `${base}/payments`;
    }
    if (type.startsWith('interview.'))
        return `${base}/interviews`;
    if (type.startsWith('proposal.')) {
        if (role === 'client' && relatedJobId)
            return `${base}/jobs/${relatedJobId}/proposals`;
        if (role === 'freelancer')
            return `${base}/proposals`;
        return `${base}/proposals`;
    }
    if (type === 'proposal.accepted' || type === 'project.started') {
        if (relatedJobId)
            return `${base}/workspace?jobId=${relatedJobId}`;
        return `${base}/projects`;
    }
    if (type.startsWith('project.')) {
        if (role === 'admin')
            return `${base}/projects`;
        return `${base}/projects`;
    }
    if (type.startsWith('workspace.')) {
        return relatedJobId ? `${base}/workspace?jobId=${relatedJobId}` : `${base}/workspace`;
    }
    return `${base}/dashboard`;
};
const sendSafe = async (data) => {
    try {
        await sendForRecipient(data);
    }
    catch (error) {
        console.error('[EventEmail] Failed to send:', error?.message || error);
    }
};
const sendForRecipient = async ({ recipientId, type, title, message, relatedJobId, relatedProjectId, relatedProposalId, }) => {
    if (!env.email.isConfigured)
        return;
    const user = await userRepository.findById(getId(recipientId));
    if (!user?.email)
        return;
    const actionUrl = buildActionUrl(type, user.role, {
        relatedJobId: getId(relatedJobId),
        relatedProjectId: getId(relatedProjectId),
        relatedProposalId: getId(relatedProposalId),
    });
    await emailService.sendEventNotificationEmail({
        to: user.email,
        firstName: user.firstName || 'there',
        title,
        message,
        actionUrl,
        actionLabel: ACTION_LABELS[type] || 'Open dashboard',
    });
};
module.exports = {
    sendSafe,
    sendForRecipient,
    buildActionUrl,
};
