import mongoose from 'mongoose';
import Performance from '../models/Performance.js';
import Employee from '../models/Employee.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

// Helper to compute score percent and category
const computeScoreAndCategory = ({ avgTaskCompletion = 0, avgOverall = 0 }) => {
  // avgOverall expected in 1-5 range -> normalize to percent
  const overallPercent = (avgOverall / 5) * 100;
  // Combine task completion and overall performance equally
  const score = Math.round(((avgTaskCompletion || 0) + overallPercent) / 2);

  let category = 'below';
  if (score >= 75) category = 'top';
  else if (score >= 60) category = 'middle';

  return { score, category };
};

// GET /api/v2/reports/employee/:employeeId
export const getEmployeeReport = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return sendError(res, 'Invalid employee id', 400);
    }

    const employee = await Employee.findById(employeeId).select('firstName lastName department');
    if (!employee) return sendError(res, 'Employee not found', 404);

    // Authorization: employees can only fetch their own report
    if (req.userRole === 'employee') {
      const userEmployee = await Employee.findOne({ userId: req.userId }).select('_id');
      if (!userEmployee || userEmployee._id.toString() !== employeeId.toString()) {
        return sendError(res, 'Not authorized to view this employee report', 403);
      }
    }

    const statsAgg = await Performance.aggregate([
      { $match: { employeeId: new mongoose.Types.ObjectId(employeeId) } },
      {
        $group: {
          _id: '$employeeId',
          totalReviews: { $sum: 1 },
          avgTaskCompletion: { $avg: '$taskCompletionRate' },
          avgProductivity: { $avg: '$productivityScore' },
          avgCollaboration: { $avg: '$teamCollaborationScore' },
          avgRating: { $avg: '$monthlyRating' },
          avgOverall: { $avg: '$overallPerformance' },
        },
      },
    ]);

    if (!statsAgg || statsAgg.length === 0) {
      return sendSuccess(res, { employee, totalReviews: 0, category: 'below', details: {} }, 'No performance data available', 200);
    }

    const s = statsAgg[0];
    const { score, category } = computeScoreAndCategory({ avgTaskCompletion: s.avgTaskCompletion, avgOverall: s.avgOverall });

    // last 6 reviews
    const trend = await Performance.find({ employeeId })
      .sort({ 'reviewPeriod.startDate': -1 })
      .limit(6)
      .select('reviewPeriod taskCompletionRate productivityScore teamCollaborationScore monthlyRating overallPerformance')
      .lean();

    const report = {
      employee: {
        id: employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        department: employee.department,
      },
      totalReviews: s.totalReviews,
      averages: {
        taskCompletionRate: Math.round((s.avgTaskCompletion || 0) * 100) / 100,
        productivityScore: Math.round((s.avgProductivity || 0) * 100) / 100,
        teamCollaborationScore: Math.round((s.avgCollaboration || 0) * 100) / 100,
        monthlyRating: Math.round((s.avgRating || 0) * 100) / 100,
        overallPerformance: Math.round((s.avgOverall || 0) * 100) / 100,
      },
      score,
      category,
      trend: trend.reverse(),
    };

    return sendSuccess(res, report, 'Employee report generated', 200);
  } catch (error) {
    next(error);
  }
};

// GET /api/v2/reports/department/:department
export const getDepartmentReport = async (req, res, next) => {
  try {
    const { department } = req.params;

    const employees = await Employee.find({ department }).select('_id firstName lastName');
    const employeeIds = employees.map(e => e._id);

    if (employeeIds.length === 0) {
      return sendSuccess(res, { department, totalEmployees: 0, totalReviews: 0, averageScore: 0, employees: [] }, 'No employees in department', 200);
    }

    const perfAgg = await Performance.aggregate([
      { $match: { employeeId: { $in: employeeIds } } },
      {
        $group: {
          _id: '$employeeId',
          avgTaskCompletion: { $avg: '$taskCompletionRate' },
          avgOverall: { $avg: '$overallPerformance' },
          reviewCount: { $sum: 1 },
        }
      }
    ]);

    const mapAgg = new Map(perfAgg.map(p => [p._id.toString(), p]));

    const employeesList = employees.map(emp => {
      const a = mapAgg.get(emp._id.toString());
      const avgTask = a?.avgTaskCompletion || 0;
      const avgOverall = a?.avgOverall || 0;
      const { score, category } = computeScoreAndCategory({ avgTaskCompletion: avgTask, avgOverall });
      return {
        employeeId: emp._id,
        name: `${emp.firstName} ${emp.lastName}`,
        score,
        category,
        reviewCount: a?.reviewCount || 0,
      };
    });

    const totalReviews = perfAgg.reduce((s, p) => s + (p.reviewCount || 0), 0);
    const averageScore = employeesList.length > 0 ? Math.round((employeesList.reduce((s, e) => s + e.score, 0) / employeesList.length) * 100) / 100 : 0;

    return sendSuccess(res, {
      department,
      totalEmployees: employeesList.length,
      totalReviews,
      averageScore,
      employees: employeesList,
    }, 'Department report generated', 200);
  } catch (error) {
    next(error);
  }
};

export default {
  getEmployeeReport,
  getDepartmentReport,
};
