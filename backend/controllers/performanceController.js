// controllers/performanceController.js
// Performance Controller

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

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const performances = await Performance.find({ employeeId }).sort({
      'reviewPeriod.startDate': -1,
    });

    if (performances.length === 0) {
      return sendSuccess(res, {}, 'No performance data available', 200);
    }

    const averageTaskCompletion =
      performances.reduce((sum, p) => sum + p.taskCompletionRate, 0) /
      performances.length;
    const averageProductivity =
      performances.reduce((sum, p) => sum + p.productivityScore, 0) /
      performances.length;
    const averageCollaboration =
      performances.reduce((sum, p) => sum + p.teamCollaborationScore, 0) /
      performances.length;
    const averageRating =
      performances.reduce((sum, p) => sum + p.monthlyRating, 0) / performances.length;
    const averagePerformance =
      performances.reduce((sum, p) => sum + p.overallPerformance, 0) /
      performances.length;

    const analytics = {
      totalReviews: performances.length,
      averageTaskCompletion: Math.round(averageTaskCompletion * 100) / 100,
      averageProductivity: Math.round(averageProductivity * 100) / 100,
      averageCollaboration: Math.round(averageCollaboration * 100) / 100,
      averageRating: Math.round(averageRating * 100) / 100,
      averagePerformance: Math.round(averagePerformance * 100) / 100,
      trend: performances.slice(0, 6).reverse(),
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

    const employees = await Employee.find({ department });
    const employeeIds = employees.map((e) => e._id);

    const performances = await Performance.find({
      employeeId: { $in: employeeIds },
    });

    const avgPerformance =
      performances.length > 0
        ? Math.round(
            (performances.reduce((sum, p) => sum + p.overallPerformance, 0) /
              performances.length) *
              100
          ) / 100
        : 0;

    const deptAnalytics = {
      department,
      totalEmployees: employeeIds.length,
      totalReviews: performances.length,
      averagePerformance: avgPerformance,
      employees: employeeIds.map((id) => {
        const emp = employees.find((e) => e._id.toString() === id.toString());
        const perf = performances.find(
          (p) => p.employeeId.toString() === id.toString()
        );
        return {
          employeeId: id,
          name: `${emp.firstName} ${emp.lastName}`,
          performance: perf?.overallPerformance || 0,
        };
      }),
    };

    return sendSuccess(
      res,
      deptAnalytics,
      'Department performance fetched successfully',
      200
    );
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
