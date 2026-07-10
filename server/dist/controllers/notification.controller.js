"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notificationService = require('../services/notification.service');
const { sendSuccess } = require('../utils/response');
const listNotifications = async (req, res) => {
    const result = await notificationService.listNotifications(req.user.id, req.query);
    return sendSuccess(res, {
        message: 'Notifications retrieved successfully',
        data: result.notifications,
        meta: result.meta,
    });
};
const getUnreadCount = async (req, res) => {
    const result = await notificationService.getUnreadCount(req.user.id);
    return sendSuccess(res, {
        message: 'Unread notification count retrieved successfully',
        data: result,
    });
};
const markNotificationRead = async (req, res) => {
    const notification = await notificationService.markNotificationRead(req.params.id, req.user.id);
    return sendSuccess(res, {
        message: 'Notification marked as read',
        data: notification,
    });
};
const markAllNotificationsRead = async (req, res) => {
    const result = await notificationService.markAllNotificationsRead(req.user.id);
    return sendSuccess(res, {
        message: 'All notifications marked as read',
        data: result,
    });
};
module.exports = {
    listNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
};
