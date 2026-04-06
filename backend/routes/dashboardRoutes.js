import express from 'express';
import { getDashboardStats, getMonthlyTrend } from '../src/controllers/dashboardController.js';

const router = express.Router();

router.get('/dashboard', getDashboardStats);
router.get('/dashboard/monthly-trend', getMonthlyTrend);

export default router;
