const Notification = require('../models/Notification').default;

const create = (data) => Notification.create(data);

const findById = (id: string) => Notification.findById(id).lean();

const findByRecipient = ({ recipientId, skip, limit, unreadOnly = false }) => {
  const filter: Record<string, unknown> = { recipientId };
  if (unreadOnly) filter.isRead = false;

  return Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

const countByRecipient = (recipientId: string, filter: Record<string, unknown> = {}) =>
  Notification.countDocuments({ recipientId, ...filter });

const markRead = (id: string, recipientId: string) =>
  Notification.findOneAndUpdate(
    { _id: id, recipientId },
    { isRead: true },
    { returnDocument: 'after' }
  ).lean();

const markAllRead = (recipientId: string) =>
  Notification.updateMany({ recipientId, isRead: false }, { isRead: true });

module.exports = {
  create,
  findById,
  findByRecipient,
  countByRecipient,
  markRead,
  markAllRead,
};
