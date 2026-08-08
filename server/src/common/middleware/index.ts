module.exports = {
  authenticate: require('./auth.middleware').authenticate,
  authorize: require('./role.middleware').authorize,
  validate: require('./validation.middleware').validate,
  errorHandler: require('./error.middleware'),
  notFound: require('./notFound.middleware'),
  logger: require('./logger.middleware'),
  handleUpload: require('./upload.middleware'),
};
