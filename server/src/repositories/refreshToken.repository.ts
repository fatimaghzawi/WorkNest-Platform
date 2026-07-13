const RefreshToken = require('../models/RefreshToken').default;

const create = (data) => RefreshToken.create(data);

const findByTokenHash = (tokenHash: string) =>
  RefreshToken.findOne({ tokenHash, expiresAt: { $gt: new Date() } }).lean();

const deleteByTokenHash = (tokenHash: string) => RefreshToken.deleteOne({ tokenHash });

const deleteAllForUser = (userId: string) => RefreshToken.deleteMany({ userId });

module.exports = {
  create,
  findByTokenHash,
  deleteByTokenHash,
  deleteAllForUser,
};
