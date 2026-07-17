"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env = require('../../config/env');
const userRepository = require('../../repositories/user.repository');
const emailService = require('./email.service');
const { clientPath } = require('../../utils/appUrls');
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
const rolePrefix = (role) => {
    if (role === 'admin')
        return '/admin';
    if (role === 'freelancer')
        return '/freelancer';
    return '/client';
};
/**
 * Keep email deep-links aligned with client/src/utils/notificationLinks.ts
 * so in-app notifications and emails open the same screens.
 */
const buildActionUrl = (type, role, { relatedJobId, relatedProjectId, relatedProposalId, } = {}) => {
    const prefix = rolePrefix(role);
    const jobId = relatedJobId || '';
    if (type.startsWith('proposal.')) {
        if (type === 'proposal.accepted' && jobId) {
            return clientPath(`${prefix}/workspace?jobId=${jobId}`);
        }
        if (type === 'proposal.rejected' && role === 'freelancer') {
            return clientPath(`${prefix}/jobs`);
        }
        if (role === 'client' && jobId) {
            return clientPath(`${prefix}/jobs/${jobId}/proposals`);
        }
        return clientPath(`${prefix}/proposals`);
    }
    if (type.startsWith('project.') || type.startsWith('workspace.')) {
        if (jobId)
            return clientPath(`${prefix}/workspace?jobId=${jobId}`);
        if (type.startsWith('project.') && role !== 'admin') {
            return clientPath(`${prefix}/projects`);
        }
        return clientPath(`${prefix}/workspace`);
    }
    if (type.startsWith('interview.')) {
        return clientPath(`${prefix}/interviews`);
    }
    if (type.startsWith('payment.')) {
        if (type === 'payment.platform_fee')
            return clientPath('/admin/wallet');
        if (role === 'client')
            return clientPath('/client/payments');
        if (role === 'freelancer')
            return clientPath('/freelancer/wallet');
        return clientPath('/admin/wallet');
    }
    return clientPath(`${prefix}/dashboard`);
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
