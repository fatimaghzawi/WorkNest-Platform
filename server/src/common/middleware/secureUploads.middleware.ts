const path = require('path');
const fs = require('fs');
const AppError = require('../errors/AppError');
const { authenticate } = require('./auth.middleware');
const asyncHandler = require('../utils/asyncHandler');
const { getUploadSubfolder } = require('../utils/uploadPaths');
const workspaceAttachmentRepository = require('../../modules/workspace/workspaceAttachment.repository');
const workspaceService = require('../../modules/workspace/workspace.service');

const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;

/**
 * Authenticated download for workspace files (replaces public static serving).
 * Filename must match stored attachment; caller must be a job participant.
 */
const serveWorkspaceFile = asyncHandler(async (req, res) => {
  const filename = path.basename(String(req.params.filename || ''));
  if (!filename || !SAFE_NAME.test(filename) || filename.includes('..')) {
    throw new AppError('Invalid file name', 400);
  }

  const relativeUrl = `/uploads/workspace/${filename}`;
  const attachment = await workspaceAttachmentRepository.findByFileUrl(relativeUrl);
  if (!attachment) {
    throw new AppError('File not found', 404);
  }

  const jobId = attachment.jobId?.toString?.() || String(attachment.jobId);
  await workspaceService.assertCanAccessJobFiles(jobId, req.user.id, req.user.role);

  const absolutePath = path.join(getUploadSubfolder('workspace'), filename);
  if (!fs.existsSync(absolutePath)) {
    throw new AppError('File not found', 404);
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, max-age=3600');
  return res.sendFile(absolutePath);
});

const registerSecureUploadRoutes = (app) => {
  app.get(
    '/uploads/workspace/:filename',
    authenticate,
    serveWorkspaceFile
  );
};

module.exports = {
  registerSecureUploadRoutes,
  serveWorkspaceFile,
};
