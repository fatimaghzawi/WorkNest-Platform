"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { getPublicFileUrl } = require('../utils/upload.util');
const resolveAvatarUrl = (file) => getPublicFileUrl(file, 'profile');
const resolveWorkspaceFileUrl = (file) => getPublicFileUrl(file, 'workspace');
module.exports = {
    resolveAvatarUrl,
    resolveWorkspaceFileUrl,
};
