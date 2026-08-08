const RefreshToken = require('./refreshToken.model').default;

const create = (data) => RefreshToken.create(data);

const findByTokenHash = (tokenHash: string) =>
  RefreshToken.findOne({ tokenHash, expiresAt: { $gt: new Date() } }).lean();

/** Atomic consume — prevents concurrent refresh minting multiple sessions. */
const consumeByTokenHash = (tokenHash: string) =>
  RefreshToken.findOneAndDelete({ tokenHash, expiresAt: { $gt: new Date() } }).lean();

const deleteByTokenHash = (tokenHash: string) => RefreshToken.deleteOne({ tokenHash });

const deleteAllForUser = (userId: string) => RefreshToken.deleteMany({ userId });

module.exports = {
  create,
  findByTokenHash,
  consumeByTokenHash,
  deleteByTokenHash,
  deleteAllForUser,
};
