/**
 * routes/counselingRoutes.js
 * API routes for Counseling Workspace
 * All routes require authentication and counselor role
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
router.post('/campus-visits', counselingController.createCampusVisit);
router.get('/campus-visits/:id', counselingController.getCampusVisit);
router.put('/campus-visits/:id', counselingController.updateCampusVisit);
router.delete('/campus-visits/:id', counselingController.deleteCampusVisit);

// Lead search (for auto-fill in visit creation)
router.get('/leads/search', counselingController.searchLeads);

export default router;
