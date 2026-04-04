import express from 'express';
import { getFunnel } from '../controllers/funnelController.js';
import authMiddleware from '../../middleware/auth.js';

const router = express.Router();

router.get('/dashboard/funnel', getFunnel);

export default router;
