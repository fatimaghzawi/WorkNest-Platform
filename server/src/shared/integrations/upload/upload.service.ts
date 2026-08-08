const { getPublicFileUrl } = require('../../../common/utils/upload.util');

const resolveAvatarUrl = (file) => getPublicFileUrl(file, 'profile');

const resolveWorkspaceFileUrl = (file) => getPublicFileUrl(file, 'workspace');

module.exports = {
  resolveAvatarUrl,
  resolveWorkspaceFileUrl,
};
