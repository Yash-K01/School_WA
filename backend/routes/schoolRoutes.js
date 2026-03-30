import express from 'express';
import { getAllSchools, getSchoolById, createSchool } from '../controllers/schoolController.js';

const router = express.Router();
/**
 * School Routes
 * Base path: /api/schools
 */

// GET all schools
router.get('/', getAllSchools);

// GET school by ID
router.get('/:id', getSchoolById);

// POST create new school
router.post('/', createSchool);

export default router;
