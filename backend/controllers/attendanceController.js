// controllers/attendanceController.js
// Attendance Controller

import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import {
  calculateWorkingHours,
  isLateArrival,
  getLateMinutes,
  calculateAttendancePercentage,
} from '../utils/calculationUtils.js';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/responseUtils.js';
import { getPaginationParams } from '../utils/paginationUtils.js';

// Mark Attendance / Check-in
export const markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status, notes } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const attendanceDate = new Date(date);
    const startOfDay = new Date(attendanceDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(attendanceDate.setHours(23, 59, 59, 999));

    // Check if attendance already exists for this day
    let attendance = await Attendance.findOne({
      employeeId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!attendance) {
      attendance = new Attendance({
        employeeId,
        date: new Date(date),
        status: status || 'present',
        notes,
      });
    } else {
      attendance.status = status || attendance.status;
      if (notes) attendance.notes = notes;
    }

    await attendance.save();

    return sendSuccess(res, attendance, 'Attendance marked successfully', 201);
  } catch (error) {
    console.error('Mark attendance error:', error);
    next(error);
  }
};

// Check-in
export const checkIn = async (req, res, next) => {
  try {
    // SECURITY: Get employeeId from authenticated user, not request body
    const employee = await Employee.findOne({ userId: req.userId });
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    let attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (attendance && attendance.checkInTime) {
      return sendError(res, 'Already checked in today', 400);
    }

    const checkInTime = new Date();
    const isLate = isLateArrival(checkInTime);
    const lateMinutes = getLateMinutes(checkInTime);

    if (!attendance) {
      attendance = new Attendance({
        employeeId: employee._id,
        date: new Date(),
        checkInTime,
        status: isLate ? 'late' : 'present',
        isLate,
        lateMinutes,
      });
    } else {
      attendance.checkInTime = checkInTime;
      attendance.status = isLate ? 'late' : 'present';
      attendance.isLate = isLate;
      attendance.lateMinutes = lateMinutes;
    }

    await attendance.save();

    return sendSuccess(res, attendance, 'Check-in successful', 201);
  } catch (error) {
    console.error('Check-in error:', error);
    next(error);
  }
};

// Check-out
export const checkOut = async (req, res, next) => {
  try {
    // SECURITY: Get employeeId from authenticated user, not request body
    const employee = await Employee.findOne({ userId: req.userId });
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!attendance) {
      return sendError(res, 'No check-in record found for today', 404);
    }

    if (attendance.checkOutTime) {
      return sendError(res, 'Already checked out today', 400);
    }

    if (!attendance.checkInTime) {
      return sendError(res, 'No check-in time recorded', 400);
    }

    attendance.checkOutTime = new Date();
    attendance.totalHours = calculateWorkingHours(attendance.checkInTime, attendance.checkOutTime);

    await attendance.save();

    return sendSuccess(res, attendance, 'Check-out successful', 200);
  } catch (error) {
    console.error('Check-out error:', error);
    next(error);
  }
};

// Get Attendance History
export const getAttendanceHistory = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { page, limit, skip } = getPaginationParams(req.query);
    const { startDate, endDate } = req.query;

    // SECURITY: Employees can only view their own attendance
    if (req.userRole === 'employee') {
      const userEmployee = await Employee.findOne({ userId: req.userId });
      if (userEmployee._id.toString() !== employeeId) {
        return sendError(res, 'Not authorized to view other employees attendance', 403);
      }
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    let query = { employeeId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const total = await Attendance.countDocuments(query);
    const attendance = await Attendance.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    return sendPaginatedResponse(res, attendance, page, limit, total, 'Attendance history fetched successfully');
  } catch (error) {
    console.error('Get attendance history error:', error);
    next(error);
  }
};

// Get Monthly Attendance Report
export const getMonthlyReport = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.params;

    // SECURITY: Employees can only view their own reports
    if (req.userRole === 'employee') {
      const userEmployee = await Employee.findOne({ userId: req.userId });
      if (userEmployee._id.toString() !== employeeId) {
        return sendError(res, 'Not authorized to view other employees attendance', 403);
      }
    }

    // Validate month and year format
    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      return sendError(res, 'Invalid month or year', 400);
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const report = {
      month: startDate.toLocaleString('default', { month: 'long' }),
      year: year,
      total: attendance.length,
      present: attendance.filter((a) => a.status === 'present').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
      late: attendance.filter((a) => a.status === 'late').length,
      onLeave: attendance.filter((a) => a.status === 'on_leave').length,
      percentage: calculateAttendancePercentage(
        attendance.filter((a) => a.status === 'present').length,
        attendance.length
      ),
      records: attendance,
    };

    return sendSuccess(res, report, 'Monthly report fetched successfully', 200);
  } catch (error) {
    console.error('Get monthly report error:', error);
    next(error);
  }
};

// Get Attendance Analytics
export const getAttendanceAnalytics = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { months = 3 } = req.query;

    // SECURITY: Employees can only view their own analytics
    if (req.userRole === 'employee') {
      const userEmployee = await Employee.findOne({ userId: req.userId });
      if (userEmployee._id.toString() !== employeeId) {
        return sendError(res, 'Not authorized to view other employees attendance', 403);
      }
    }

    // Validate months parameter
    if (isNaN(months) || months < 1 || months > 24) {
      return sendError(res, 'Invalid months parameter (must be 1-24)', 400);
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const attendance = await Attendance.find({
      employeeId,
      date: { $gte: startDate },
    });

    // Prevent division by zero
    const attendanceCount = attendance.length || 1;

    const analytics = {
      totalRecords: attendance.length,
      presentCount: attendance.filter((a) => a.status === 'present').length,
      absentCount: attendance.filter((a) => a.status === 'absent').length,
      lateCount: attendance.filter((a) => a.status === 'late').length,
      onLeaveCount: attendance.filter((a) => a.status === 'on_leave').length,
      averageWorkingHours: Math.round(
        (attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) / attendanceCount) * 100
      ) / 100,
      attendancePercentage: calculateAttendancePercentage(
        attendance.filter((a) => a.status === 'present').length,
        attendanceCount
      ),
    };

    return sendSuccess(res, analytics, 'Attendance analytics fetched successfully', 200);
  } catch (error) {
    console.error('Get analytics error:', error);
    next(error);
  }
};

export default {
  markAttendance,
  checkIn,
  checkOut,
  getAttendanceHistory,
  getMonthlyReport,
  getAttendanceAnalytics,
};
