const path = require('path');
const env = require('../config/env');

/** Always resolve uploads relative to the server package root (cwd when running npm run dev). */
const getUploadsRoot = () => path.resolve(process.cwd(), env.upload.path);

const getUploadSubfolder = (subfolder = '') => path.join(getUploadsRoot(), subfolder);

module.exports = {
  getUploadsRoot,
  getUploadSubfolder,
};
