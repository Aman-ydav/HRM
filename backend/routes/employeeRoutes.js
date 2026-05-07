// routes/employeeRoutes.js
// Employee Routes

import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllEmployees,
  updateEmployeeByAdmin,
  getEmployeeDirectory,
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
router.get('/profile', authorize('employee', 'hr_manager'), getProfile);
router.put('/profile', authorize('employee', 'hr_manager'), updateEmployeeValidation, handleValidationErrors, updateProfile);
router.get('/dashboard', authorize('employee', 'hr_manager'), getEmployeeDashboard);
router.get('/rewards', authorize('employee', 'hr_manager'), getEmployeeRewards);
router.get('/attendance-summary', authorize('employee', 'hr_manager'), getAttendanceSummary);
router.get('/performance-summary', authorize('employee', 'hr_manager'), getPerformanceSummary);
router.get('/directory', authorize('admin', 'hr_manager', 'employee'), getEmployeeDirectory);

// Admin only routes
router.get('/all', authorize('admin', 'hr_manager'), getAllEmployees);
router.put('/:employeeId', authorize('admin', 'hr_manager'), updateEmployeeByAdmin);

export default router;
