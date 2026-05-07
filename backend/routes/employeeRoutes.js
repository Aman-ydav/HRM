// routes/employeeRoutes.js
// Employee Routes

import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllEmployees,
  getEmployeeDashboard,
  getEmployeeRewards,
  getAttendanceSummary,
  getPerformanceSummary,
} from '../controllers/employeeController.js';
import { protect, authorize } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { updateEmployeeValidation } from '../validations/employeeValidation.js';

const router = express.Router();

// Protected routes
router.use(protect);

// Employee profile routes
router.get('/profile', getProfile);
router.put('/profile', updateEmployeeValidation, handleValidationErrors, updateProfile);
router.get('/dashboard', getEmployeeDashboard);
router.get('/rewards', getEmployeeRewards);
router.get('/attendance-summary', getAttendanceSummary);
router.get('/performance-summary', getPerformanceSummary);

// Admin only routes
router.get('/all', authorize('admin', 'hr_manager'), getAllEmployees);

export default router;
