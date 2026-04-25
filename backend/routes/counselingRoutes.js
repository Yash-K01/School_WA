/**
 * routes/counselingRoutes.js
 * API routes for Counseling Workspace
 * All routes require authentication
 * Base path: /api/counseling
 */

import express from 'express';
import * as counselingController from '../controllers/counselingController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Middleware: All routes require authentication
router.use(authMiddleware);

// Dashboard endpoints
router.get('/stats', counselingController.getDashboardStats);

// Campus visit management
router.get('/visits', counselingController.getVisits);
router.post('/visits', counselingController.createCampusVisit);
router.get('/visits/:id', counselingController.getCampusVisit);
router.put('/visits/:id', counselingController.updateCampusVisit);
router.delete('/visits/:id', counselingController.deleteCampusVisit);

// Time slot availability
router.get('/slots', counselingController.getTimeSlotAvailability);

// Lead search (for auto-fill in visit creation)
router.get('/leads/search', counselingController.searchLeads);

export default router;
