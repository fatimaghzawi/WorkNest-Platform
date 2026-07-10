"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User = require('../models/User').default;
const { normalizeStoredFileUrl } = require('../utils/upload.util');
const sanitizeUser = (user) => {
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    delete obj.emailVerificationToken;
    delete obj.emailVerificationExpires;
    delete obj.passwordResetToken;
    delete obj.passwordResetExpires;
    if (obj.profileImage) {
        obj.profileImage = normalizeStoredFileUrl(obj.profileImage);
    }
    return obj;
};
const findByEmail = (email, includePassword = false) => {
    const query = User.findOne({ email });
    if (includePassword) {
        query.select('+password +passwordChangedAt');
    }
    return query;
};
const findByVerificationToken = (hashedToken) => {
    return User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');
};
const findByPasswordResetToken = (hashedToken) => {
    return User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires +password');
};
const createUser = (userData) => {
    return User.create(userData);
};
const findById = (id) => {
    return User.findById(id);
};
const findByIdForAuth = (id) => {
    return User.findById(id).select('+passwordChangedAt');
};
const updateUser = (id, updateData) => {
    return User.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true });
};
const deleteUser = (id) => {
    return User.findByIdAndDelete(id);
};
module.exports = {
    sanitizeUser,
    findByEmail,
    findByVerificationToken,
    findByPasswordResetToken,
    createUser,
    findById,
    findByIdForAuth,
    updateUser,
    deleteUser,
};
