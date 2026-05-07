// controllers/dashboardController.js
// Dashboard and Analytics Controller

import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Performance from '../models/Performance.js';
import Reward from '../models/Reward.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

// Get Admin Dashboard
export const getAdminDashboard = async (req, res, next) => {
  try {
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Get counts
    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    const totalUsers = await User.countDocuments();
    const totalRewards = await Reward.countDocuments({ approvalStatus: 'approved' });
    const monthlyRewards = await Reward.countDocuments({
      approvalStatus: 'approved',
      month: `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`,
    });

    // Get attendance metrics
    const attendanceRecords = await Attendance.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });
    const presentRecords = attendanceRecords.filter((a) => a.status === 'present').length;
    const attendancePercentage =
      attendanceRecords.length > 0 ? Math.round((presentRecords / attendanceRecords.length) * 100) : 0;

    // Get top performers
    const topPerformers = await Performance.find()
      .sort({ monthlyRating: -1 })
      .limit(5)
      .populate('employeeId', 'firstName lastName email department');

    // Get reward distribution
    const rewardsByType = await Reward.aggregate([
      { $match: { approvalStatus: 'approved' } },
      { $group: { _id: '$rewardType', count: { $sum: 1 }, total: { $sum: '$bonus' } } },
    ]);

    // Get total bonus distributed
    const totalBonusDistributed = await Reward.aggregate([
      { $match: { rewardType: 'bonus', approvalStatus: 'approved' } },
      { $group: { _id: null, total: { $sum: '$bonus' } } },
    ]);

    const dashboard = {
      overview: {
        totalEmployees,
        totalUsers,
        totalRewards,
        monthlyRewards,
      },
      attendance: {
        currentMonth: `${currentMonth.toLocaleString('default', { month: 'long' })} ${currentMonth.getFullYear()}`,
        attendancePercentage,
        totalRecords: attendanceRecords.length,
        presentRecords,
      },
      performance: {
        topPerformers,
      },
      rewards: {
        totalBonusDistributed: totalBonusDistributed[0]?.total || 0,
        byType: rewardsByType,
      },
    };

    return sendSuccess(res, dashboard, 'Admin dashboard fetched successfully', 200);
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    next(error);
  }
};

// Get Monthly Trends
export const getMonthlyTrends = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;

    const trends = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      // Attendance
      const attendance = await Attendance.find({
        date: { $gte: startDate, $lte: endDate },
      });
      const attendancePercentage =
        attendance.length > 0
          ? Math.round(
              (attendance.filter((a) => a.status === 'present').length / attendance.length) * 100
            )
          : 0;

      // Rewards
      const rewards = await Reward.countDocuments({
        month: monthStr,
        approvalStatus: 'approved',
      });

      // Performance reviews
      const performances = await Performance.countDocuments({
        'reviewPeriod.startDate': { $gte: startDate, $lte: endDate },
      });

      trends.push({
        month: monthStr,
        attendance: attendancePercentage,
        rewards,
        performances,
      });
    }

    return sendSuccess(res, trends, 'Monthly trends fetched successfully', 200);
  } catch (error) {
    console.error('Get trends error:', error);
    next(error);
  }
};

// Get Department Analytics
export const getDepartmentAnalytics = async (req, res, next) => {
  try {
    const departments = await Employee.distinct('department');

    const analytics = await Promise.all(
      departments.map(async (dept) => {
        const employees = await Employee.find({ department: dept });
        const employeeIds = employees.map((e) => e._id);

        const avgRewardPoints = employees.length > 0
          ? Math.round(
              (employees.reduce((sum, e) => sum + e.rewardPoints, 0) / employees.length) * 100
            ) / 100
          : 0;

        const avgPerformance = await Performance.aggregate([
          { $match: { employeeId: { $in: employeeIds } } },
          { $group: { _id: null, avg: { $avg: '$overallPerformance' } } },
        ]);

        return {
          department: dept,
          totalEmployees: employeeIds.length,
          averageRewardPoints: avgRewardPoints,
          averagePerformance: avgPerformance[0]?.avg || 0,
        };
      })
    );

    return sendSuccess(res, analytics, 'Department analytics fetched successfully', 200);
  } catch (error) {
    console.error('Get department analytics error:', error);
    next(error);
  }
};

// Get Attendance Analytics
export const getAttendanceAnalytics = async (req, res, next) => {
  try {
    const { month } = req.query;

    const date = month ? new Date(month) : new Date();
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const records = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate('employeeId', 'firstName lastName department');

    const analytics = {
      month: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
      totalRecords: records.length,
      present: records.filter((a) => a.status === 'present').length,
      absent: records.filter((a) => a.status === 'absent').length,
      late: records.filter((a) => a.status === 'late').length,
      onLeave: records.filter((a) => a.status === 'on_leave').length,
      attendancePercentage:
        records.length > 0
          ? Math.round((records.filter((a) => a.status === 'present').length / records.length) * 100)
          : 0,
    };

    return sendSuccess(res, analytics, 'Attendance analytics fetched successfully', 200);
  } catch (error) {
    console.error('Get attendance analytics error:', error);
    next(error);
  }
};

// Get Reward Analytics
export const getRewardAnalytics = async (req, res, next) => {
  try {
    const { month } = req.query;

    const query = { approvalStatus: 'approved' };
    if (month) {
      query.month = month;
    } else {
      const date = new Date();
      query.month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    const rewards = await Reward.find(query);

    const byType = {};
    const byEmployee = {};

    rewards.forEach((r) => {
      if (!byType[r.rewardType]) {
        byType[r.rewardType] = { count: 0, total: 0 };
      }
      byType[r.rewardType].count += 1;
      byType[r.rewardType].total += r.bonus || r.points || 0;

      if (!byEmployee[r.employeeId]) {
        byEmployee[r.employeeId] = { count: 0, points: 0, bonus: 0 };
      }
      byEmployee[r.employeeId].count += 1;
      byEmployee[r.employeeId].points += r.points || 0;
      byEmployee[r.employeeId].bonus += r.bonus || 0;
    });

    const analytics = {
      month: query.month,
      totalRewards: rewards.length,
      byType,
      topEmployees: Object.entries(byEmployee)
        .map(([empId, data]) => ({
          employeeId: empId,
          rewardCount: data.count,
          totalPoints: data.points,
          totalBonus: data.bonus,
        }))
        .sort((a, b) => b.totalBonus - a.totalBonus)
        .slice(0, 10),
    };

    return sendSuccess(res, analytics, 'Reward analytics fetched successfully', 200);
  } catch (error) {
    console.error('Get reward analytics error:', error);
    next(error);
  }
};

export default {
  getAdminDashboard,
  getMonthlyTrends,
  getDepartmentAnalytics,
  getAttendanceAnalytics,
  getRewardAnalytics,
};
