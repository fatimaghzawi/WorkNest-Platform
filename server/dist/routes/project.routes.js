"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require('express');
const projectController = require('../controllers/project.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validation.middleware');
const asyncHandler = require('../utils/asyncHandler');
const { z } = require('zod');
const { objectIdSchema } = require('../models/shared/zod');
const { PROJECT_STATUSES } = require('../models/Project');
const { projectIdSchema, submitProjectSchema, requestReviewSchema, cancelProjectSchema, } = require('../validators/project.validator');
const router = Router();
const listSchema = {
    query: z.object({
        status: z.enum(PROJECT_STATUSES).optional(),
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
    }),
};
const idSchema = {
    params: z.object({
        id: objectIdSchema,
    }),
};
router.get('/stats', authenticate, authorize('admin'), asyncHandler(projectController.getProjectStats));
router.get('/', authenticate, authorize('admin', 'client', 'freelancer'), validate(listSchema), asyncHandler(projectController.listProjects));
router.get('/:id', authenticate, authorize('admin', 'client', 'freelancer'), validate(idSchema), asyncHandler(projectController.getProject));
router.patch('/:id/submit', authenticate, authorize('freelancer', 'admin'), validate(submitProjectSchema), asyncHandler(projectController.submitForReview));
router.patch('/:id/accept', authenticate, authorize('client', 'admin'), validate(projectIdSchema), asyncHandler(projectController.acceptProject));
router.patch('/:id/request-review', authenticate, authorize('client', 'admin'), validate(requestReviewSchema), asyncHandler(projectController.requestRevision));
router.patch('/:id/cancel', authenticate, authorize('client', 'admin'), validate(cancelProjectSchema), asyncHandler(projectController.cancelProject));
module.exports = router;
