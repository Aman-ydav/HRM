// routes/dashboardRoutes.js
// Dashboard and Analytics Routes

import express from 'express';
import {
  getAdminDashboard,
  getMonthlyTrends,
  getDepartmentAnalytics,
  getAttendanceAnalytics,
  getRewardAnalytics,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.use(protect);
router.use(authorize('admin', 'hr_manager'));

// Dashboard routes
router.get('/admin', getAdminDashboard);
router.get('/trends', getMonthlyTrends);
router.get('/departments', getDepartmentAnalytics);
router.get('/attendance', getAttendanceAnalytics);
router.get('/rewards', getRewardAnalytics);

export default router;
