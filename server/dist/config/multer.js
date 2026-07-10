"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const env = require('./env');
const { cloudinary, isConfigured } = require('./cloudinary');
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
const createCloudinaryStorage = (folder = 'general') => {
    if (!isConfigured) {
        throw new Error('Cloudinary is not configured. Check your environment variables.');
    }
    return new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => ({
            folder: `worknest/${folder}`,
            resource_type: 'auto',
            public_id: `${file.fieldname}-${Date.now()}`,
        }),
    });
};
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const imageFileFilter = (req, file, cb) => {
    if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
        return;
    }
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
};
const createUpload = ({ storage, fields, single, array, multiple, fileFilter: customFileFilter } = {}) => {
    const upload = multer({
        storage,
        limits,
        fileFilter: customFileFilter || fileFilter,
    });
    if (single)
        return upload.single(single);
    if (array)
        return upload.array(array.field, array.maxCount || 5);
    if (multiple)
        return upload.fields(multiple);
    if (fields)
        return upload.fields(fields);
    return upload;
};
const uploadTemp = createUpload({
    storage: createDiskStorage('temp'),
});
const uploadProfile = createUpload({
    storage: isConfigured ? createCloudinaryStorage('profile') : createDiskStorage('profile'),
    single: 'avatar',
});
const uploadAvatar = createUpload({
    storage: isConfigured ? createCloudinaryStorage('profile') : createDiskStorage('profile'),
    single: 'avatar',
    fileFilter: imageFileFilter,
});
const uploadPortfolio = createUpload({
    storage: isConfigured ? createCloudinaryStorage('portfolio') : createDiskStorage('portfolio'),
    array: { field: 'files', maxCount: 10 },
});
const uploadDocument = createUpload({
    storage: isConfigured ? createCloudinaryStorage('documents') : createDiskStorage('temp'),
    single: 'document',
});
const uploadWorkspace = createUpload({
    storage: isConfigured ? createCloudinaryStorage('workspace') : createDiskStorage('workspace'),
    single: 'file',
});
module.exports = {
    limits,
    fileFilter,
    createDiskStorage,
    createCloudinaryStorage,
    createUpload,
    uploadTemp,
    uploadProfile,
    uploadAvatar,
    uploadPortfolio,
    uploadDocument,
    uploadWorkspace,
};
