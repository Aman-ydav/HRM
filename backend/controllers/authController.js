// controllers/authController.js
// Authentication Controller

import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { generateToken } from '../utils/tokenUtils.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/emailUtils.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';
import crypto from 'crypto';

// Register
export const register = async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName, department, position } = req.body;

    // Validate required fields
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    // SECURITY: Only allow employee or hr_manager registration, NOT admin
    if (role === 'admin') {
      return sendError(res, 'Admin accounts cannot be created via registration', 403);
    }

    if (role && !['employee', 'hr_manager'].includes(role)) {
      return sendError(res, 'Invalid role. Only employee or hr_manager allowed', 400);
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return sendError(res, 'Email already registered', 409);
    }

    // Create user
    user = new User({
      email,
      password,
      role: role || 'employee',
    });
    await user.save();

    // If employee role, create employee profile
    if (role !== 'admin') {
      const employeeId = `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Validate employee fields
      if (!firstName || !lastName) {
        // Delete user if employee profile creation fails
        await User.findByIdAndDelete(user._id);
        return sendError(res, 'First name and last name are required for employee registration', 400);
      }

      await Employee.create({
        userId: user._id,
        employeeId,
        firstName,
        lastName,
        email,
        department: department || 'Unassigned',
        position: position || 'Not Specified',
        joiningDate: new Date(),
      });
    }

    // Send welcome email (non-blocking - don't fail if email fails)
    sendWelcomeEmail(email, firstName || 'User').catch((err) => {
      console.warn('Welcome email failed (non-critical):', err.message);
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return sendSuccess(
      res,
      { user: { id: user._id, email: user.email, role: user.role }, token },
      'Registration successful',
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    // Get user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'User account is inactive', 403);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    return sendSuccess(res, { user: { id: user._id, email: user.email, role: user.role }, token }, 'Login successful', 200);
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// Logout
export const logout = async (req, res) => {
  res.clearCookie('token');
  return sendSuccess(res, null, 'Logout successful', 200);
};

// Forgot Password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Send email
    const resetUrl = `${process.env.API_BASE_URL}/api/v1/auth/reset-password/${resetToken}`;
    await sendPasswordResetEmail(email, resetUrl);

    return sendSuccess(res, null, 'Password reset link sent to email', 200);
  } catch (error) {
    console.error('Forgot password error:', error);
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { resetToken } = req.params;

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 'Invalid or expired reset token', 400);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return sendSuccess(res, null, 'Password reset successful', 200);
  } catch (error) {
    console.error('Reset password error:', error);
    next(error);
  }
};

// Get Current User
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const employee = await Employee.findOne({ userId: req.userId });

    return sendSuccess(res, { user, employee }, 'User fetched successfully', 200);
  } catch (error) {
    console.error('Get current user error:', error);
    next(error);
  }
};

// Change Password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return sendError(res, 'Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, null, 'Password changed successfully', 200);
  } catch (error) {
    console.error('Change password error:', error);
    next(error);
  }
};

export default {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  changePassword,
};
