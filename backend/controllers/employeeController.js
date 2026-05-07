// controllers/employeeController.js
// Employee Controller

import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Performance from '../models/Performance.js';
import Reward from '../models/Reward.js';
import Feedback from '../models/Feedback.js';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/responseUtils.js';
import { getPaginationParams, buildPaginationMeta } from '../utils/paginationUtils.js';

// Get Employee Profile
export const getProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.userId })
      .populate('userId', 'email role')
      .populate('manager', 'firstName lastName email')
      .populate('reportingTo', 'firstName lastName email');

    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    return sendSuccess(res, employee, 'Profile fetched successfully', 200);
  } catch (error) {
    console.error('Get profile error:', error);
    next(error);
  }
};

// Update Employee Profile
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, department, position, address } = req.body;

    const employee = await Employee.findOne({ userId: req.userId });

    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    // Update allowed fields
    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    if (phone) employee.phone = phone;
    if (department) employee.department = department;
    if (position) employee.position = position;
    if (address) employee.address = { ...employee.address, ...address };

    await employee.save();

    return sendSuccess(res, employee, 'Profile updated successfully', 200);
  } catch (error) {
    console.error('Update profile error:', error);
    next(error);
  }
};

// Get All Employees (Admin only)
export const getAllEmployees = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { department, status, search } = req.query;

    let query = {};

    if (department) query.department = department;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email role')
      .sort({ createdAt: -1 });

    return sendPaginatedResponse(res, employees, page, limit, total, 'Employees fetched successfully');
  } catch (error) {
    console.error('Get all employees error:', error);
    next(error);
  }
};

// Update Employee by Admin/HR
export const updateEmployeeByAdmin = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const {
      firstName,
      lastName,
      phone,
      department,
      position,
      status,
      rewardPoints,
      totalBonus,
    } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    if (firstName !== undefined) employee.firstName = firstName;
    if (lastName !== undefined) employee.lastName = lastName;
    if (phone !== undefined) employee.phone = phone;
    if (department !== undefined) employee.department = department;
    if (position !== undefined) employee.position = position;
    if (status !== undefined) employee.status = status;
    if (rewardPoints !== undefined) employee.rewardPoints = Number(rewardPoints);
    if (totalBonus !== undefined) employee.totalBonus = Number(totalBonus);

    await employee.save();

    return sendSuccess(res, employee, 'Employee updated successfully', 200);
  } catch (error) {
    console.error('Update employee by admin error:', error);
    next(error);
  }
};

// Get Employee Directory (lightweight list for selectors/search)
export const getEmployeeDirectory = async (req, res, next) => {
  try {
    const employees = await Employee.find({ status: 'active' })
      .select('_id employeeId firstName lastName department position email')
      .sort({ firstName: 1, lastName: 1 });

    return sendSuccess(res, employees, 'Employee directory fetched successfully', 200);
  } catch (error) {
    console.error('Get employee directory error:', error);
    next(error);
  }
};

// Get Employee Dashboard
export const getEmployeeDashboard = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.userId });

    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    // Get attendance data
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const attendanceRecords = await Attendance.find({
      employeeId: employee._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const presentDays = attendanceRecords.filter((a) => a.status === 'present').length;
    const totalDays = attendanceRecords.length;

    // Get recent rewards
    const rewards = await Reward.find({ employeeId: employee._id })
      .limit(5)
      .sort({ createdAt: -1 });

    // Get recent feedback
    const feedbacks = await Feedback.find({ receiver: employee._id })
      .limit(5)
      .sort({ createdAt: -1 });

    // Get latest performance
    const performance = await Performance.findOne({ employeeId: employee._id })
      .sort({ createdAt: -1 });

    const dashboardData = {
      employee: {
        name: `${employee.firstName} ${employee.lastName}`,
        position: employee.position,
        department: employee.department,
        rewardPoints: employee.rewardPoints,
        totalBonus: employee.totalBonus,
        badges: employee.badges,
      },
      attendance: {
        presentDays,
        totalDays,
        percentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
      },
      performance,
      recentRewards: rewards,
      recentFeedback: feedbacks,
    };

    return sendSuccess(res, dashboardData, 'Dashboard data fetched successfully', 200);
  } catch (error) {
    console.error('Get dashboard error:', error);
    next(error);
  }
};

// Get Employee Rewards
export const getEmployeeRewards = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const employee = await Employee.findOne({ userId: req.userId });

    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const total = await Reward.countDocuments({ employeeId: employee._id });
    const rewards = await Reward.find({ employeeId: employee._id })
      .skip(skip)
      .limit(limit)
      .populate('awardedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    return sendPaginatedResponse(res, rewards, page, limit, total, 'Rewards fetched successfully');
  } catch (error) {
    console.error('Get rewards error:', error);
    next(error);
  }
};

// Get Attendance Summary
export const getAttendanceSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const employee = await Employee.findOne({ userId: req.userId });

    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()), 1);
    const endDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()) + 1, 0);

    const attendance = await Attendance.find({
      employeeId: employee._id,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const summary = {
      month: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
      totalDays: attendance.length,
      present: attendance.filter((a) => a.status === 'present').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
      late: attendance.filter((a) => a.status === 'late').length,
      onLeave: attendance.filter((a) => a.status === 'on_leave').length,
      percentage: attendance.length > 0 ? Math.round((attendance.filter((a) => a.status === 'present').length / attendance.length) * 100) : 0,
      records: attendance,
    };

    return sendSuccess(res, summary, 'Attendance summary fetched successfully', 200);
  } catch (error) {
    console.error('Get attendance summary error:', error);
    next(error);
  }
};

// Get Performance Summary
export const getPerformanceSummary = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.userId });

    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const performances = await Performance.find({ employeeId: employee._id })
      .sort({ 'reviewPeriod.startDate': -1 })
      .limit(12);

    return sendSuccess(res, performances, 'Performance summary fetched successfully', 200);
  } catch (error) {
    console.error('Get performance summary error:', error);
    next(error);
  }
};

export default {
  getProfile,
  updateProfile,
  getAllEmployees,
  updateEmployeeByAdmin,
  getEmployeeDirectory,
  getEmployeeDashboard,
  getEmployeeRewards,
  getAttendanceSummary,
  getPerformanceSummary,
};
