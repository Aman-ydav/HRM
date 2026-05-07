// routes/performanceRoutes.js
// Performance Routes

import express from 'express';
import {
  addPerformanceReview,
  updatePerformanceReview,
  getPerformanceHistory,
  getPerformanceAnalytics,
  getTopPerformers,
  getDepartmentPerformance,
} from '../controllers/performanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Performance review routes
router.post('/add', authorize('admin', 'hr_manager'), addPerformanceReview);
router.put('/:id', authorize('admin', 'hr_manager'), updatePerformanceReview);

// Get routes
router.get('/history/:employeeId', getPerformanceHistory);
router.get('/analytics/:employeeId', getPerformanceAnalytics);
router.get('/top-performers', authorize('admin', 'hr_manager'), getTopPerformers);
router.get('/department/:department', getDepartmentPerformance);

export default router;
