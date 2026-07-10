const profileService = require('../services/profile.service');
const uploadService = require('../services/upload.service');
const { sendSuccess } = require('../utils/response');
const AppError = require('../utils/AppError');

const getMyProfile = async (req, res) => {
  const profile = await profileService.getMyProfile(req.user.id);

  return sendSuccess(res, {
    message: 'Profile retrieved successfully',
    data: profile,
  });
};

const updateMyProfile = async (req, res) => {
  const profile = await profileService.updateMyProfile(
    req.user.id,
    req.body
  );

  return sendSuccess(res, {
    message: 'Profile updated successfully',
    data: profile,
  });
};

const uploadAvatar = async (req, res) => {
  if (!req.file) {
    throw new AppError('No image uploaded.', 400);
  }

  const profileImage =
    uploadService.resolveAvatarUrl(req.file);

  const profile = await profileService.uploadAvatar(
    req.user.id,
    profileImage
  );

  return sendSuccess(res, {
    message: 'Avatar uploaded successfully',
    data: profile,
  });
};

const getPublicFreelancerProfile = async (req, res) => {
  const data = await profileService.getPublicFreelancerProfile(
    req.params.freelancerId
  );

  return sendSuccess(res, {
    message: 'Freelancer profile retrieved successfully',
    data,
  });
};

const getPublicClientProfile = async (req, res) => {
  const data = await profileService.getPublicClientProfile(
    req.params.clientId,
    req.user.id,
    req.user.role
  );

  return sendSuccess(res, {
    message: 'Client profile retrieved successfully',
    data,
  });
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  getPublicFreelancerProfile,
  getPublicClientProfile,
};