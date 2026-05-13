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
import protect, { authorize } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Performance review routes
router.post('/add', authorize('admin', 'hr_manager'), addPerformanceReview);
router.put('/:id', authorize('admin', 'hr_manager'), updatePerformanceReview);

// Get routes
router.get('/history/:employeeId', getPerformanceHistory);

// Cache analytics and top performers to reduce DB load
router.get('/analytics/:employeeId', cacheMiddleware(30), getPerformanceAnalytics);
router.get('/top-performers', cacheMiddleware(30), authorize('admin', 'hr_manager', 'employee'), getTopPerformers);
router.get('/department/:department', cacheMiddleware(60), getDepartmentPerformance);

export default router;
