const path = require('path');

const normalizeStoredFileUrl = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') return fileUrl;
  if (fileUrl.startsWith('/uploads/')) return fileUrl;

  try {
    const parsed = new URL(fileUrl);
    if (parsed.pathname.startsWith('/uploads/')) {
      return parsed.pathname;
    }
  } catch {
    // keep original value
  }

  return fileUrl;
};

const getPublicFileUrl = (file, subfolder = 'general') => {
  if (!file) return null;

  const remoteUrl =
    file.secure_url ||
    file.url ||
    (file.path && /^https?:\/\//i.test(file.path) ? file.path : null);

  if (remoteUrl) return remoteUrl;

  const filename = file.filename || path.basename(file.path || '');
  if (!filename) return null;

  // Store a relative path so clients resolve the correct host in dev and production.
  return `/uploads/${subfolder}/${filename}`;
};

module.exports = {
  getPublicFileUrl,
  normalizeStoredFileUrl,
};
