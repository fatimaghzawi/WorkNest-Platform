const workspaceService = require('../services/workspace.service');
const { sendSuccess } = require('../utils/response');
const AppError = require('../utils/AppError');

const listTasks = async (req, res) => {
  const { tasks, readOnly, permissions, progress, meta } = await workspaceService.listTasks(
    req.params.jobId,
    req.user.id,
    req.user.role,
    req.query
  );
  return sendSuccess(res, {
    message: 'Workspace tasks retrieved successfully',
    data: tasks,
    meta: { readOnly, permissions, progress, ...meta },
  });
};

const createTask = async (req, res) => {
  const task = await workspaceService.createTask(
    req.params.jobId,
    req.user.id,
    req.user.role,
    req.body
  );
  return sendSuccess(res, {
    statusCode: 201,
    message: 'Task created successfully',
    data: task,
  });
};

const updateTask = async (req, res) => {
  const task = await workspaceService.updateTask(
    req.params.jobId,
    req.params.taskId,
    req.user.id,
    req.user.role,
    req.body
  );
  return sendSuccess(res, {
    message: 'Task updated successfully',
    data: task,
  });
};

const deleteTask = async (req, res) => {
  await workspaceService.deleteTask(req.params.jobId, req.params.taskId, req.user.id, req.user.role);
  return sendSuccess(res, {
    message: 'Task deleted successfully',
  });
};

const getTeam = async (req, res) => {
  const team = await workspaceService.getWorkspaceTeam(
    req.params.jobId,
    req.user.id,
    req.user.role
  );
  return sendSuccess(res, {
    message: 'Workspace team retrieved successfully',
    data: team,
  });
};

const listAttachments = async (req, res) => {
  const { attachments, meta } = await workspaceService.listAttachments(
    req.params.jobId,
    req.user.id,
    req.user.role,
    req.query
  );
  return sendSuccess(res, {
    message: 'Workspace attachments retrieved successfully',
    data: attachments,
    meta,
  });
};

const listTaskDeliverables = async (req, res) => {
  const { groups, meta } = await workspaceService.listTaskDeliverables(
    req.params.jobId,
    req.user.id,
    req.user.role,
    req.query
  );
  return sendSuccess(res, {
    message: 'Task deliverables retrieved successfully',
    data: groups,
    meta,
  });
};

const uploadAttachment = async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const attachment = await workspaceService.uploadAttachment(
    req.params.jobId,
    req.user.id,
    req.user.role,
    req.file,
    { caption: req.body?.caption, taskId: req.body?.taskId }
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Attachment uploaded successfully',
    data: attachment,
  });
};

const deleteAttachment = async (req, res) => {
  await workspaceService.deleteAttachment(
    req.params.jobId,
    req.params.attachmentId,
    req.user.id,
    req.user.role
  );
  return sendSuccess(res, {
    message: 'Attachment deleted successfully',
  });
};

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  getTeam,
  listAttachments,
  listTaskDeliverables,
  uploadAttachment,
  deleteAttachment,
};
