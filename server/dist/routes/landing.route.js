"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { Router } = require('express');
const landingController = require('../controllers/landing.controller');
const asyncHandler = require('../utils/asyncHandler');
const router = Router();
// Public — no authenticate/authorize. Used by the unauthenticated landing page.
router.get('/featured-jobs', asyncHandler(landingController.getFeaturedJobs));
router.get('/top-freelancers', asyncHandler(landingController.getTopFreelancers));
router.get('/freelancers', asyncHandler(landingController.listFreelancers));
module.exports = router;
