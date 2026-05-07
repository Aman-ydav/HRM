// routes/rewardRoutes.js
// Reward Routes

import express from 'express';
import {
  assignReward,
  approveReward,
  getRewards,
  getAllRewards,
  getRewardLeaderboard,
  getBonusHistory,
  getRewardsByType,
} from '../controllers/rewardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Reward routes
router.post('/assign', authorize('admin', 'hr_manager'), assignReward);
router.put('/approve/:id', authorize('admin'), approveReward);

// Get routes
router.get('/all', authorize('admin', 'hr_manager'), getAllRewards);
router.get('/employee/:employeeId', getRewards);
router.get('/leaderboard', getRewardLeaderboard);
router.get('/bonus-history/:employeeId', getBonusHistory);
router.get('/by-type', authorize('admin', 'hr_manager'), getRewardsByType);

export default router;
