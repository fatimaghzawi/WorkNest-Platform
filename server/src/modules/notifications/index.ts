const notificationRoutes = require('./notification.routes');
const notificationController = require('./notification.controller');
const notificationService = require('./notification.service');
const notificationTriggers = require('./notificationTriggers');
const notificationRepository = require('./notification.repository');
const Notification = require('./notification.model').default;

module.exports = {
  notificationRoutes,
  notificationController,
  notificationService,
  notificationTriggers,
  notificationRepository,
  Notification,
};
