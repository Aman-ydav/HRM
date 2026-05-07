// routes/attendanceRoutes.js
// Attendance Routes

import express from 'express';
import {
  markAttendance,
  checkIn,
  checkOut,
  getAttendanceHistory,
  getMonthlyReport,
  getAttendanceAnalytics,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Attendance routes
router.post('/mark', authorize('admin', 'hr_manager', 'employee'), markAttendance);
router.post('/check-in', authorize('employee'), checkIn);
router.post('/check-out', authorize('employee'), checkOut);

// Get routes
router.get('/history/:employeeId', getAttendanceHistory);
router.get('/report/:employeeId/:month/:year', getMonthlyReport);
router.get('/analytics/:employeeId', getAttendanceAnalytics);

export default router;
