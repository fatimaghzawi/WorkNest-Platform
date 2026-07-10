const User = require('../models/User').default;

const SAFE_USER_SELECT =
  '-password -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires';

const PUBLIC_FREELANCER_SELECT =
  'firstName lastName profileImage bio skills portfolioLink emailVerified createdAt role isActive';

const findById = (id: string) =>
  User.findById(id).select(SAFE_USER_SELECT);

const findPublicFreelancerById = (id: string) =>
  User.findById(id).select(PUBLIC_FREELANCER_SELECT);

const PUBLIC_CLIENT_SELECT =
  'firstName lastName profileImage bio emailVerified createdAt role isActive';

const findPublicClientById = (id: string) =>
  User.findById(id).select(PUBLIC_CLIENT_SELECT);

const updateProfile = (id: string, data: Record<string, unknown>) =>
  User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).select(SAFE_USER_SELECT);

const updateAvatar = (id: string, profileImage: string) =>
  User.findByIdAndUpdate(
    id,
    { profileImage },
    {
      new: true,
      runValidators: true,
    }
  ).select(SAFE_USER_SELECT);

module.exports = {
  findById,
  findPublicFreelancerById,
  findPublicClientById,
  updateProfile,
  updateAvatar,
};