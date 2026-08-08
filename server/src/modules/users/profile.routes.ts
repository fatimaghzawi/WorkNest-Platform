const { Router } = require('express');

const profileController = require('./profile.controller');

const {
  authenticate,
} = require('../../common/middleware/auth.middleware');

const {
  authorize,
} = require('../../common/middleware/role.middleware');

const {
  validate,
} = require('../../common/middleware/validation.middleware');

const {
  handleUpload,
} = require('../../common/middleware/upload.middleware');

const {
  uploadAvatar,
} = require('../../config/multer');

const asyncHandler = require('../../common/utils/asyncHandler');

const {
  updateProfileSchema,
  publicFreelancerProfileSchema,
  publicClientProfileSchema,
} = require('./profile.validation');


const router = Router();


router.use(authenticate);


// Get current logged user profile
router.get(
  '/me',
  asyncHandler(profileController.getMyProfile)
);


// Update profile information
router.patch(
  '/me',
  validate(updateProfileSchema),
  asyncHandler(profileController.updateMyProfile)
);


// Upload avatar image
router.post(
  '/me/avatar',
  handleUpload(uploadAvatar),
  asyncHandler(profileController.uploadAvatar)
);

router.get(
  '/freelancers/:freelancerId',
  authorize('client', 'admin'),
  validate(publicFreelancerProfileSchema),
  asyncHandler(profileController.getPublicFreelancerProfile)
);

router.get(
  '/clients/:clientId',
  authorize('freelancer', 'admin'),
  validate(publicClientProfileSchema),
  asyncHandler(profileController.getPublicClientProfile)
);


module.exports = router;