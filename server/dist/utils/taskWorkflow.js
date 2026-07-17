"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError = require('./AppError');
const FREELANCER_TRANSITIONS = {
    todo: ['in_progress'],
    in_progress: ['review'],
    review: ['in_progress'],
    done: [],
};
// Client transitions for reviewing freelancer-owned tasks (approve / request changes).
// Own-task client status changes are handled in workspace.service without CLIENT_TRANSITIONS.
const CLIENT_TRANSITIONS = {
    review: ['done', 'in_progress'],
};
const assertStatusTransition = (userRole, fromStatus, toStatus) => {
    if (fromStatus === toStatus)
        return;
    if (userRole === 'admin')
        return;
    if (userRole === 'freelancer') {
        const allowed = FREELANCER_TRANSITIONS[fromStatus] || [];
        if (allowed.includes(toStatus))
            return;
        throw new AppError(`Freelancers can move tasks from ${formatStatus(fromStatus)} to ${allowed.map(formatStatus).join(' or ') || 'nowhere'}`, 400);
    }
    if (userRole === 'client') {
        const allowed = CLIENT_TRANSITIONS[fromStatus] || [];
        if (allowed.includes(toStatus))
            return;
        throw new AppError('Clients can only approve or request changes on tasks in review', 403);
    }
    throw new AppError('You cannot change this task status', 403);
};
const formatStatus = (status) => status.replace(/_/g, ' ');
const canTransition = (userRole, fromStatus, toStatus) => {
    if (fromStatus === toStatus)
        return true;
    if (userRole === 'admin')
        return true;
    if (userRole === 'freelancer') {
        return (FREELANCER_TRANSITIONS[fromStatus] || []).includes(toStatus);
    }
    if (userRole === 'client') {
        return (CLIENT_TRANSITIONS[fromStatus] || []).includes(toStatus);
    }
    return false;
};
const getAllowedTargetColumns = (userRole, fromStatus) => {
    if (userRole === 'admin')
        return ['todo', 'in_progress', 'review', 'done'];
    if (userRole === 'freelancer')
        return FREELANCER_TRANSITIONS[fromStatus] || [];
    if (userRole === 'client')
        return CLIENT_TRANSITIONS[fromStatus] || [];
    return [];
};
module.exports = {
    assertStatusTransition,
    canTransition,
    getAllowedTargetColumns,
    FREELANCER_TRANSITIONS,
    CLIENT_TRANSITIONS,
};
