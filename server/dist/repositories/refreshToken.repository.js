"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RefreshToken = require('../models/RefreshToken').default;
const create = (data) => RefreshToken.create(data);
const findByTokenHash = (tokenHash) => RefreshToken.findOne({ tokenHash, expiresAt: { $gt: new Date() } }).lean();
const deleteByTokenHash = (tokenHash) => RefreshToken.deleteOne({ tokenHash });
const deleteAllForUser = (userId) => RefreshToken.deleteMany({ userId });
module.exports = {
    create,
    findByTokenHash,
    deleteByTokenHash,
    deleteAllForUser,
};
