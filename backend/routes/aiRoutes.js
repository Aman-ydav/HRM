// routes/aiRoutes.js
// AI Analysis Routes

import express from 'express';
import {
  getAIRecommendations,
  getBurnoutAnalysis,
  getRewardFairnessAnalysis,
} from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.use(protect);

// AI routes
router.get('/recommendations/:employeeId', getAIRecommendations);
router.get('/burnout-analysis', authorize('admin', 'hr_manager'), getBurnoutAnalysis);
router.get('/fairness-analysis', authorize('admin', 'hr_manager'), getRewardFairnessAnalysis);

export default router;
