// routes/feedbackRoutes.js
// Feedback Routes

import express from 'express';
import {
  submitFeedback,
  getEmployeeFeedback,
  getFeedbackGiven,
  deleteFeedback,
  getFeedbackAnalytics,
  updateFeedbackStatus,
} from '../controllers/feedbackController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Feedback routes
router.post('/submit', submitFeedback);
router.delete('/:id', deleteFeedback);
router.put('/:id', updateFeedbackStatus);

// Get routes
router.get('/received/:employeeId', getEmployeeFeedback);
router.get('/given/:employeeId', getFeedbackGiven);
router.get('/analytics/:employeeId', getFeedbackAnalytics);

export default router;
