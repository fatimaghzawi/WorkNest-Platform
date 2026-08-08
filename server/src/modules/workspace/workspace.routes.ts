const { Router } = require('express');
const workspaceController = require('./workspace.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const { handleUpload } = require('../../common/middleware/upload.middleware');
const { uploadWorkspace } = require('../../config/multer');
const asyncHandler = require('../../common/utils/asyncHandler');
const {
  jobIdParamSchema,
  taskIdParamSchema,
  attachmentIdParamSchema,
  createTaskSchema,
  updateTaskSchema,
  listWorkspaceQuerySchema,
} = require('./workspace.validation');

const router = Router();

router.get(
  '/:jobId/team',
  authenticate,
  authorize('client', 'freelancer', 'admin'),
  validate(jobIdParamSchema),
  asyncHandler(workspaceController.getTeam)
);

router.get(
  '/:jobId/attachments',
  authenticate,
  authorize('client', 'freelancer', 'admin'),
  validate(listWorkspaceQuerySchema),
  asyncHandler(workspaceController.listAttachments)
);

router.get(
  '/:jobId/deliverables',
  authenticate,
  authorize('client', 'freelancer', 'admin'),
  validate(listWorkspaceQuerySchema),
  asyncHandler(workspaceController.listTaskDeliverables)
);

router.post(
  '/:jobId/attachments',
  authenticate,
  authorize('freelancer', 'admin'),
  validate(jobIdParamSchema),
  handleUpload(uploadWorkspace),
  asyncHandler(workspaceController.uploadAttachment)
);

router.delete(
  '/:jobId/attachments/:attachmentId',
  authenticate,
  authorize('freelancer', 'admin'),
  validate(attachmentIdParamSchema),
  asyncHandler(workspaceController.deleteAttachment)
);

router.get(
  '/:jobId/tasks',
  authenticate,
  authorize('client', 'freelancer', 'admin'),
  validate(listWorkspaceQuerySchema),
  asyncHandler(workspaceController.listTasks)
);

router.post(
  '/:jobId/tasks',
  authenticate,
  authorize('client', 'freelancer', 'admin'),
  validate(createTaskSchema),
  asyncHandler(workspaceController.createTask)
);

router.patch(
  '/:jobId/tasks/:taskId',
  authenticate,
  authorize('client', 'freelancer', 'admin'),
  validate(updateTaskSchema),
  asyncHandler(workspaceController.updateTask)
);

router.delete(
  '/:jobId/tasks/:taskId',
  authenticate,
  authorize('client', 'freelancer', 'admin'),
  validate(taskIdParamSchema),
  asyncHandler(workspaceController.deleteTask)
);

module.exports = router;
