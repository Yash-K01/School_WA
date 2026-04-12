import express from 'express';
import {
  getCommunicationLogs,
  getRecipients,
  sendCommunication,
  updateCommunicationStatus,
} from '../controllers/communicationController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/recipients', getRecipients);
router.post('/send', sendCommunication);
router.get('/logs', getCommunicationLogs);
router.put('/:id/status', updateCommunicationStatus);

export default router;
