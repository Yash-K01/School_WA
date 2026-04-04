import express from 'express';
import { getFunnel } from '../controllers/funnelController.js';

const router = express.Router();

router.get('/dashboard/funnel', getFunnel);

export default router;
