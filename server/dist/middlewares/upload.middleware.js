"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError = require('../utils/AppError');
const handleUpload = (uploadMiddleware) => (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
        if (!err) {
            next();
            return;
        }
        if (err.name === 'MulterError') {
            const message = err.code === 'LIMIT_FILE_SIZE'
                ? 'Image is too large. Please upload a file under 5MB.'
                : err.message;
            next(new AppError(message, 400));
            return;
        }
        next(new AppError(err.message || 'Upload failed', 400));
    });
};
module.exports = {
    handleUpload,
};
