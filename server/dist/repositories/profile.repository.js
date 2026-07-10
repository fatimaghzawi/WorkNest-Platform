"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require('../models/User').default;
const SAFE_USER_SELECT = '-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires';
const PUBLIC_FREELANCER_SELECT = 'firstName lastName profileImage bio skills portfolioLink emailVerified createdAt role isActive';
const findById = (id) => User.findById(id).select(SAFE_USER_SELECT);
const findPublicFreelancerById = (id) => User.findById(id).select(PUBLIC_FREELANCER_SELECT);
const PUBLIC_CLIENT_SELECT = 'firstName lastName profileImage bio emailVerified createdAt role isActive';
const findPublicClientById = (id) => User.findById(id).select(PUBLIC_CLIENT_SELECT);
const updateProfile = (id, data) => User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
}).select(SAFE_USER_SELECT);
const updateAvatar = (id, profileImage) => User.findByIdAndUpdate(id, { profileImage }, {
    new: true,
    runValidators: true,
}).select(SAFE_USER_SELECT);
module.exports = {
    findById,
    findPublicFreelancerById,
    findPublicClientById,
    updateProfile,
    updateAvatar,
};
