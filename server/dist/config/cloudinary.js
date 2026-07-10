"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary = require('cloudinary').v2;
const env = require('./env');
const isConfigured = env.cloudinary.cloudName &&
    env.cloudinary.apiKey &&
    env.cloudinary.apiSecret;
if (isConfigured) {
    cloudinary.config({
        cloud_name: env.cloudinary.cloudName,
        api_key: env.cloudinary.apiKey,
        api_secret: env.cloudinary.apiSecret,
        secure: true,
    });
}
const uploadOptions = {
    folder: 'worknest',
    resource_type: 'auto',
};
module.exports = {
    cloudinary,
    isConfigured,
    uploadOptions,
};
