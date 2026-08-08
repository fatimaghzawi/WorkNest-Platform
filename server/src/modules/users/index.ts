const userRoutes = require('./user.routes');
const profileRoutes = require('./profile.routes');
const userController = require('./user.controller');
const profileController = require('./profile.controller');
const userService = require('./user.service');
const profileService = require('./profile.service');
const userRepository = require('./user.repository');
const profileRepository = require('./profile.repository');
const User = require('./user.model').default;
const { ROLES } = require('./user.model');

module.exports = {
  userRoutes,
  profileRoutes,
  userController,
  profileController,
  userService,
  profileService,
  userRepository,
  profileRepository,
  User,
  ROLES,
};
