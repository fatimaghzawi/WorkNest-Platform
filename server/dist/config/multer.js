"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('./env');
const { getUploadSubfolder } = require('../utils/uploadPaths');
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
];
const limits = {
    fileSize: env.upload.maxFileSize,
};
const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
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
const createDiskStorage = (subfolder = '') => multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, resolveUploadPath(subfolder));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '-');
        const uniqueName = `${baseName}-${Date.now()}${ext}`;
        cb(null, uniqueName);
    },
});
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const imageFileFilter = (req, file, cb) => {
    if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
        return;
    }
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
};
const createUpload = ({ storage, single, fileFilter: customFileFilter } = {}) => multer({
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
