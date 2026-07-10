"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Notification = require('../models/Notification').default;
const create = (data) => Notification.create(data);
const findById = (id) => Notification.findById(id).lean();
const findByRecipient = ({ recipientId, skip, limit, unreadOnly = false }) => {
    const filter = { recipientId };
    if (unreadOnly)
        filter.isRead = false;
    return Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
};
const countByRecipient = (recipientId, filter = {}) => Notification.countDocuments({ recipientId, ...filter });
const markRead = (id, recipientId) => Notification.findOneAndUpdate({ _id: id, recipientId }, { isRead: true }, { returnDocument: 'after' }).lean();
const markAllRead = (recipientId) => Notification.updateMany({ recipientId, isRead: false }, { isRead: true });
module.exports = {
    create,
    findById,
    findByRecipient,
    countByRecipient,
    markRead,
    markAllRead,
};
