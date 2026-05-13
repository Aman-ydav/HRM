// controllers/performanceController.js
// Performance Controller

import mongoose from 'mongoose';
import Performance from '../models/Performance.js';
import Employee from '../models/Employee.js';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/responseUtils.js';
import { getPaginationParams } from '../utils/paginationUtils.js';

// Add Performance Review
export const addPerformanceReview = async (req, res, next) => {
  try {
    const {
      employeeId,
      taskCompletionRate,
      productivityScore,
      teamCollaborationScore,
      managerFeedback,
      monthlyRating,
      improvementAreas,
      strengths,
      goals,
    } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const overallPerformance =
      (taskCompletionRate / 100 + productivityScore + teamCollaborationScore) / 3.5;

    const performance = new Performance({
      employeeId,
      reviewPeriod: {
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      },
      taskCompletionRate,
      productivityScore,
      teamCollaborationScore,
      managerFeedback,
      monthlyRating,
      overallPerformance: Math.round(overallPerformance * 100) / 100,
      improvementAreas,
      strengths,
      goals,
      reviewedBy: req.userId,
      comments: req.body.comments,
    });

    await performance.save();

    // Update employee performance score
    employee.performanceScore = performance.overallPerformance;
    await employee.save();

    return sendSuccess(res, performance, 'Performance review added successfully', 201);
  } catch (error) {
    console.error('Add performance review error:', error);
    next(error);
  }
};

// Update Performance Review
export const updatePerformanceReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { taskCompletionRate, productivityScore, teamCollaborationScore, monthlyRating, comments } = req.body;

    const performance = await Performance.findById(id);
    if (!performance) {
      return sendError(res, 'Performance review not found', 404);
    }

    // Update fields
    if (taskCompletionRate) performance.taskCompletionRate = taskCompletionRate;
    if (productivityScore) performance.productivityScore = productivityScore;
    if (teamCollaborationScore) performance.teamCollaborationScore = teamCollaborationScore;
    if (monthlyRating) performance.monthlyRating = monthlyRating;
    if (comments) performance.comments = comments;

    // Recalculate overall performance
    if (taskCompletionRate || productivityScore || teamCollaborationScore) {
      const overallPerformance =
        ((performance.taskCompletionRate || taskCompletionRate) / 100 +
          (performance.productivityScore || productivityScore) +
          (performance.teamCollaborationScore || teamCollaborationScore)) /
        3.5;
      performance.overallPerformance = Math.round(overallPerformance * 100) / 100;
    }

    await performance.save();

    return sendSuccess(res, performance, 'Performance review updated successfully', 200);
  } catch (error) {
    console.error('Update performance review error:', error);
    next(error);
  }
};

// Get Performance History
export const getPerformanceHistory = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { page, limit, skip } = getPaginationParams(req.query);

    if (req.userRole === 'employee') {
      const userEmployee = await Employee.findOne({ userId: req.userId });
      if (!userEmployee || userEmployee._id.toString() !== employeeId) {
        return sendError(res, 'Not authorized to view other employees performance', 403);
      }
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const total = await Performance.countDocuments({ employeeId });
    const performances = await Performance.find({ employeeId })
      .skip(skip)
      .limit(limit)
      .populate('reviewedBy', 'firstName lastName')
      .sort({ 'reviewPeriod.startDate': -1 });

    return sendPaginatedResponse(res, performances, page, limit, total, 'Performance history fetched successfully');
  } catch (error) {
    console.error('Get performance history error:', error);
    next(error);
  }
};

// Get Performance Analytics
export const getPerformanceAnalytics = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (req.userRole === 'employee') {
      const userEmployee = await Employee.findOne({ userId: req.userId });
      if (!userEmployee || userEmployee._id.toString() !== employeeId) {
        return sendError(res, 'Not authorized to view other employees analytics', 403);
      }
    }

    // Validate employee exists
    const employee = await Employee.findById(employeeId).select('_id');
    if (!employee) return sendError(res, 'Employee not found', 404);

    // Aggregate averages server-side for efficiency
    const agg = await Performance.aggregate([
      { $match: { employeeId: new mongoose.Types.ObjectId(employeeId) } },
      {
        $group: {
          _id: '$employeeId',
          totalReviews: { $sum: 1 },
          averageTaskCompletion: { $avg: '$taskCompletionRate' },
          averageProductivity: { $avg: '$productivityScore' },
          averageCollaboration: { $avg: '$teamCollaborationScore' },
          averageRating: { $avg: '$monthlyRating' },
          averageOverall: { $avg: '$overallPerformance' },
        },
      },
    ]);

    if (!agg || agg.length === 0) {
      return sendSuccess(res, {}, 'No performance data available', 200);
    }

    const stats = agg[0];

    // Get last 6 reviews for trend
    const trend = await Performance.find({ employeeId })
      .sort({ 'reviewPeriod.startDate': -1 })
      .limit(6)
      .select('reviewPeriod monthlyRating overallPerformance taskCompletionRate')
      .lean();

    const analytics = {
      totalReviews: stats.totalReviews,
      averageTaskCompletion: Math.round(stats.averageTaskCompletion * 100) / 100,
      averageProductivity: Math.round(stats.averageProductivity * 100) / 100,
      averageCollaboration: Math.round(stats.averageCollaboration * 100) / 100,
      averageRating: Math.round(stats.averageRating * 100) / 100,
      averagePerformance: Math.round(stats.averageOverall * 100) / 100,
      trend: trend.reverse(),
    };

    return sendSuccess(res, analytics, 'Performance analytics fetched successfully', 200);
  } catch (error) {
    console.error('Get analytics error:', error);
    next(error);
  }
};

// Get Top Performers
export const getTopPerformers = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const topPerformers = await Performance.find()
      .sort({ monthlyRating: -1 })
      .limit(parseInt(limit))
      .populate('employeeId', 'firstName lastName email department')
      .populate('reviewedBy', 'firstName lastName');

    return sendSuccess(res, topPerformers, 'Top performers fetched successfully', 200);
  } catch (error) {
    console.error('Get top performers error:', error);
    next(error);
  }
};

// Get Department Performance
export const getDepartmentPerformance = async (req, res, next) => {
  try {
    const { department } = req.params;
    // Use aggregation to compute department-level stats efficiently
    const employees = await Employee.find({ department }).select('_id firstName lastName');
    const employeeIds = employees.map((e) => e._id);

    if (employeeIds.length === 0) {
      return sendSuccess(res, { department, totalEmployees: 0, totalReviews: 0, averagePerformance: 0, employees: [] }, 'No employees in department', 200);
    }

    const perfAgg = await Performance.aggregate([
      { $match: { employeeId: { $in: employeeIds } } },
      {
        $group: {
          _id: '$employeeId',
          avgPerformance: { $avg: '$overallPerformance' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const totalReviews = perfAgg.reduce((sum, p) => sum + (p.reviewCount || 0), 0);
    const averagePerformance = perfAgg.length > 0
      ? Math.round((perfAgg.reduce((sum, p) => sum + (p.avgPerformance || 0), 0) / perfAgg.length) * 100) / 100
      : 0;

    const employeesMap = new Map(employees.map(e => [e._id.toString(), e]));

    const employeesList = employeeIds.map(id => {
      const agg = perfAgg.find(p => p._id.toString() === id.toString());
      const emp = employeesMap.get(id.toString());
      return {
        employeeId: id,
        name: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown',
        performance: agg ? Math.round((agg.avgPerformance || 0) * 100) / 100 : 0,
        reviewCount: agg ? agg.reviewCount : 0,
      };
    });

    const deptAnalytics = {
      department,
      totalEmployees: employeeIds.length,
      totalReviews,
      averagePerformance,
      employees: employeesList,
    };

    return sendSuccess(res, deptAnalytics, 'Department performance fetched successfully', 200);
  } catch (error) {
    console.error('Get department performance error:', error);
    next(error);
  }
};

export default {
  addPerformanceReview,
  updatePerformanceReview,
  getPerformanceHistory,
  getPerformanceAnalytics,
  getTopPerformers,
  getDepartmentPerformance,
};
