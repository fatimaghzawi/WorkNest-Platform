const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const env = require('./env');
const { getUploadSubfolder } = require('../common/utils/uploadPaths');

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);

const limits = {
  fileSize: env.upload.maxFileSize,
};

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
    return;
  }

  cb(new Error(`File type not allowed: ${file.mimetype}`), false);
};

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const resolveUploadPath = (subfolder = '') => {
  const basePath = getUploadSubfolder(subfolder);
  ensureDir(basePath);
  return basePath;
};

const createDiskStorage = (subfolder = '') =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, resolveUploadPath(subfolder));
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '';
      const uniqueName = `${crypto.randomUUID()}${safeExt}`;
      cb(null, uniqueName);
    },
  });

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (IMAGE_MIME_TYPES.includes(file.mimetype) && IMAGE_EXTENSIONS.has(ext)) {
    cb(null, true);
    return;
  }

  cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
};

const createUpload = ({ storage, single, fileFilter: customFileFilter }: any = {}) =>
  multer({
    storage,
    limits,
    fileFilter: customFileFilter || fileFilter,
  }).single(single);

const uploadAvatar = createUpload({
  storage: createDiskStorage('profile'),
  single: 'avatar',
  fileFilter: imageFileFilter,
});

const uploadWorkspace = createUpload({
  storage: createDiskStorage('workspace'),
  single: 'file',
});

module.exports = {
  uploadAvatar,
  uploadWorkspace,
};
