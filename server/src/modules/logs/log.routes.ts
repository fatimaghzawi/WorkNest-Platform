const { Router } = require('express');
const logController = require('./log.controller');
const { authenticate } = require('../../common/middleware/auth.middleware');
const { authorize } = require('../../common/middleware/role.middleware');
const { validate } = require('../../common/middleware/validation.middleware');
const asyncHandler = require('../../common/utils/asyncHandler');
const { listLogsSchema } = require('./log.validation');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', asyncHandler(logController.getLogStats));
router.get('/', validate(listLogsSchema), asyncHandler(logController.listLogs));

module.exports = router;
