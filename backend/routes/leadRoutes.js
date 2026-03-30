import express from 'express';
import { getAllLeads, searchLeads, getLeadById, createLead, updateLeadStatus } from '../controllers/leadController.js';

const router = express.Router();
/**
 * Lead Routes
 * Base path: /api/leads
 */

// GET all leads with optional filters (school_id, status)
router.get('/', getAllLeads);

// GET search leads
router.get('/search', searchLeads);

// GET lead by ID
router.get('/:id', getLeadById);

// POST create new lead
router.post('/', createLead);

// PUT update lead follow-up status
router.put('/:id/status', updateLeadStatus);

export default router;
