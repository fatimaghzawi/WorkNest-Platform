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

const findByEmail = (email: string, includePassword = false) => {
  const query = User.findOne({ email });
  if (includePassword) {
    query.select('+password +passwordChangedAt');
  }
  return query;
};

const findByGoogleId = (googleId: string) => User.findOne({ googleId });

const findByGithubId = (githubId: string) => User.findOne({ githubId });

const findByVerificationToken = (hashedToken: string) => {
  return User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpires');
};

const findByPasswordResetToken = (hashedToken: string) => {
  return User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires +password');
};

const createUser = (userData) => {
  return User.create(userData);
};

const findById = (id: string) => {
  return User.findById(id);
};

const findByIdForAuth = (id: string) => {
  return User.findById(id).select('+passwordChangedAt');
};

const updateUser = (id: string, updateData) => {
  return User.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true });
};

const deleteUser = (id: string) => {
  return User.findByIdAndDelete(id);
};

module.exports = {
  sanitizeUser,
  findByEmail,
  findByGoogleId,
  findByGithubId,
  findByVerificationToken,
  findByPasswordResetToken,
  createUser,
  findById,
  findByIdForAuth,
  updateUser,
  deleteUser,
};
