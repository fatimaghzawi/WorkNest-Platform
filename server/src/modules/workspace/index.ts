const workspaceRoutes = require('./workspace.routes');
const workspaceController = require('./workspace.controller');
const workspaceService = require('./workspace.service');
const workspaceRepository = require('./workspace.repository');
const workspaceAttachmentRepository = require('./workspaceAttachment.repository');
const Task = require('./task.model').default;
const WorkspaceAttachment = require('./workspaceAttachment.model').default;
const taskWorkflow = require('./taskWorkflow');
const { TASK_STATUSES, TASK_PRIORITIES, TASK_ORIGINS } = require('./task.model');

module.exports = {
  workspaceRoutes,
  workspaceController,
  workspaceService,
  workspaceRepository,
  workspaceAttachmentRepository,
  Task,
  WorkspaceAttachment,
  taskWorkflow,
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_ORIGINS,
};
