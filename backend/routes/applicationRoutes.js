import express from 'express';
import * as applicationController from '../controllers/applicationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all application routes
router.use(authMiddleware);

/**
 * POST /api/applications
 * Create a new application from lead
 */
router.post('/', applicationController.createApplication);

/**
 * GET /api/applications/:id/progress
 * Get application progress status
 */
router.get('/:id/progress', applicationController.getApplicationProgress);

/**
 * GET /api/applications/:id/details
 * Get full application details (for prefill)
 */
router.get('/:id/details', applicationController.getApplicationDetails);

/**
 * POST /api/applications/:id/student-info
 * Save student information (Step 1)
 */
router.post('/:id/student-info', applicationController.saveStudentInfo);

/**
 * POST /api/applications/:id/parent-info
 * Save parent information (Step 2)
 */
router.post('/:id/parent-info', applicationController.saveParentInfo);

/**
 * POST /api/applications/:id/academic-info
 * Save academic information (Step 3)
 */
router.post('/:id/academic-info', applicationController.saveAcademicInfo);

/**
 * POST /api/applications/:id/documents
 * Save documents (Step 5)
 */
router.post('/:id/documents', applicationController.saveDocuments);

/**
 * POST /api/applications/:id/submit
 * Submit final application (Step 6)
 */
router.post('/:id/submit', applicationController.submitApplication);

export default router;
