const notificationRepository = require('../repositories/notification.repository');
const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

let ioInstance: { to: (room: string) => { emit: (event: string, data: unknown) => void } } | null =
  null;

const USER_ROOM_PREFIX = 'user:';

const setSocketIo = (io) => {
  ioInstance = io;
};

const toClientNotification = (doc) => {
  if (!doc) return null;

  return {
    id: doc._id.toString(),
    type: doc.type,
    title: doc.title,
    message: doc.message,
    isRead: Boolean(doc.isRead),
    relatedJobId: doc.relatedJobId?.toString(),
    relatedProposalId: doc.relatedProposalId?.toString(),
    relatedProjectId: doc.relatedProjectId?.toString(),
    relatedDeliverableId: doc.relatedDeliverableId?.toString(),
    relatedPaymentId: doc.relatedPaymentId?.toString(),
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : undefined,
  };
};

const emitToUser = (recipientId: string, payload) => {
  if (!ioInstance || !recipientId) return;
  ioInstance.to(`${USER_ROOM_PREFIX}${recipientId}`).emit('notification:new', payload);
};

const createAndNotify = async (data) => {
  const created = await notificationRepository.create(data);
  const payload = toClientNotification(created.toObject ? created.toObject() : created);
  emitToUser(data.recipientId.toString(), payload);
  return payload;
};

const notifySafe = async (fn: () => Promise<void>) => {
  try {
    await fn();
  } catch (error) {
    console.error('Notification dispatch failed:', error?.message || error);
  }
};

const listNotifications = async (recipientId: string, query: Record<string, unknown> = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const unreadOnly = query.unreadOnly === 'true' || query.unreadOnly === true;

  const [rows, total] = await Promise.all([
    notificationRepository.findByRecipient({ recipientId, skip, limit, unreadOnly }),
    notificationRepository.countByRecipient(recipientId, unreadOnly ? { isRead: false } : {}),
  ]);

  return {
    notifications: rows.map(toClientNotification),
    meta: buildPaginationMeta(total, page, limit),
  };
};

const getUnreadCount = async (recipientId: string) => {
  const count = await notificationRepository.countByRecipient(recipientId, { isRead: false });
  return { count };
};

const markNotificationRead = async (id: string, recipientId: string) => {
  const updated = await notificationRepository.markRead(id, recipientId);
  if (!updated) {
    throw new AppError('Notification not found', 404);
  }
  return toClientNotification(updated);
};

const markAllNotificationsRead = async (recipientId: string) => {
  await notificationRepository.markAllRead(recipientId);
  return { count: 0 };
};

module.exports = {
  setSocketIo,
  toClientNotification,
  createAndNotify,
  notifySafe,
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
};
