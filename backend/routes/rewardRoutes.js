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
  getRewardsByDepartment,
  getBadgeAnalytics,
} from '../controllers/rewardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Reward routes
router.post('/assign', authorize('admin', 'hr_manager'), assignReward);
router.put('/approve/:id', authorize('admin', 'hr_manager'), approveReward);

// Get routes
router.get('/all', authorize('admin', 'hr_manager'), getAllRewards);
router.get('/employee/:employeeId', getRewards);
router.get('/leaderboard', getRewardLeaderboard);
router.get('/bonus-history/:employeeId', getBonusHistory);
router.get('/by-type', authorize('admin', 'hr_manager'), getRewardsByType);
router.get('/by-department', authorize('admin', 'hr_manager'), getRewardsByDepartment);
router.get('/badges', authorize('admin', 'hr_manager'), getBadgeAnalytics);

export default router;
