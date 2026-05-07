// routes/authRoutes.js
// Authentication Routes

import express from 'express';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../validations/authValidation.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, forgotPassword);
router.post('/reset-password/:resetToken', resetPasswordValidation, handleValidationErrors, resetPassword);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/logout', protect, logout);
router.post('/change-password', protect, changePassword);

export default router;
