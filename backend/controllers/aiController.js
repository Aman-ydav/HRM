// controllers/aiController.js
// AI Analysis Controller

import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Performance from '../models/Performance.js';
import Reward from '../models/Reward.js';
import axios from 'axios';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

// Get AI Recommendations
export const getAIRecommendations = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    // Gather data for analysis
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const attendance = await Attendance.find({
      employeeId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const performance = await Performance.findOne({ employeeId }).sort({
      createdAt: -1,
    });

    const rewards = await Reward.find({ employeeId, approvalStatus: 'approved' });

    const attendancePercentage =
      attendance.length > 0
        ? Math.round(
            (attendance.filter((a) => a.status === 'present').length / attendance.length) * 100
          )
        : 0;

    // Create AI prompt
    const prompt = `
      Analyze the following employee data and provide insights and recommendations:
      
      Employee: ${employee.firstName} ${employee.lastName}
      Department: ${employee.department}
      Position: ${employee.position}
      
      Current Month Attendance: ${attendancePercentage}%
      Performance Score: ${performance?.overallPerformance || 0}/5
      Task Completion Rate: ${performance?.taskCompletionRate || 0}%
      Team Collaboration: ${performance?.teamCollaborationScore || 0}/5
      Total Rewards This Year: ${rewards.length}
      
      Based on this data, provide:
      1. Performance assessment
      2. Recommendations for improvement
      3. Reward eligibility assessment
      4. Any concerns or alerts
      5. Suggested next steps for the manager
      
      Keep response concise and actionable.
    `;

    // Call Gemini API (this is a placeholder for actual implementation)
    const recommendations = await callAIService(prompt);

    return sendSuccess(res, { recommendations }, 'AI recommendations generated successfully', 200);
  } catch (error) {
    console.error('Get AI recommendations error:', error);
    // Return mock recommendations if API fails
    return sendSuccess(
      res,
      {
        recommendations: {
          assessment: 'Employee showing consistent performance.',
          improvements: ['Focus on team collaboration', 'Attend training programs'],
          rewardEligibility: 'Eligible for bonus based on attendance',
          alerts: [],
          nextSteps: 'Schedule performance review with manager',
        },
      },
      'Mock recommendations (API not configured)',
      200
    );
  }
};

// Get Burnout Risk Analysis
export const getBurnoutAnalysis = async (req, res, next) => {
  try {
    const month = new Date();
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const employees = await Employee.find({ status: 'active' });

    const burnoutRisks = [];

    for (const emp of employees) {
      const attendance = await Attendance.find({
        employeeId: emp._id,
        date: { $gte: startDate, $lte: endDate },
      });

      const performance = await Performance.findOne({ employeeId: emp._id }).sort({
        createdAt: -1,
      });

      const lateCount = attendance.filter((a) => a.status === 'late').length;
      const attendancePercentage = attendance.length > 0 ? (attendance.filter((a) => a.status === 'present').length / attendance.length) * 100 : 0;

      // Simple burnout risk calculation
      let riskScore = 0;

      if (attendancePercentage < 80) riskScore += 20;
      if (lateCount > 5) riskScore += 30;
      if (performance && performance.overallPerformance < 2) riskScore += 25;

      if (riskScore > 50) {
        burnoutRisks.push({
          employeeId: emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          riskScore,
          riskLevel: riskScore > 70 ? 'High' : riskScore > 50 ? 'Medium' : 'Low',
          indicators: [
            attendancePercentage < 80 && 'Low attendance',
            lateCount > 5 && 'Frequent late arrivals',
            performance && performance.overallPerformance < 2 && 'Declining performance',
          ].filter(Boolean),
        });
      }
    }

    return sendSuccess(
      res,
      { burnoutRisks: burnoutRisks.sort((a, b) => b.riskScore - a.riskScore) },
      'Burnout risk analysis completed successfully',
      200
    );
  } catch (error) {
    console.error('Get burnout analysis error:', error);
    next(error);
  }
};

// Get Reward Fairness Analysis
export const getRewardFairnessAnalysis = async (req, res, next) => {
  try {
    const { month } = req.query;

    const query = { approvalStatus: 'approved' };
    if (month) {
      query.month = month;
    }

    const rewards = await Reward.find(query).populate('employeeId');

    // Analyze reward distribution
    const employees = await Employee.find({ status: 'active' });
    const employeeRewards = {};

    employees.forEach((emp) => {
      employeeRewards[emp._id] = { name: `${emp.firstName} ${emp.lastName}`, rewards: 0 };
    });

    rewards.forEach((r) => {
      if (employeeRewards[r.employeeId]) {
        employeeRewards[r.employeeId].rewards += 1;
      }
    });

    const avgRewards = Object.values(employeeRewards).reduce((sum, emp) => sum + emp.rewards, 0) / Object.keys(employeeRewards).length;

    const fairnessAnalysis = {
      totalRewards: rewards.length,
      averageRewardsPerEmployee: Math.round(avgRewards * 100) / 100,
      distribution: Object.values(employeeRewards).sort((a, b) => b.rewards - a.rewards).slice(0, 10),
      anomalies: Object.entries(employeeRewards)
        .filter(([_, emp]) => emp.rewards > avgRewards * 2)
        .map(([id, emp]) => ({
          employeeId: id,
          name: emp.name,
          rewards: emp.rewards,
          deviation: Math.round(((emp.rewards - avgRewards) / avgRewards) * 100),
        })),
    };

    return sendSuccess(res, fairnessAnalysis, 'Reward fairness analysis completed successfully', 200);
  } catch (error) {
    console.error('Get fairness analysis error:', error);
    next(error);
  }
};

// Call AI Service (Placeholder for Gemini API)
const callAIService = async (prompt) => {
  try {
    // This is where you would call the actual Gemini API
    // For now, return mock recommendations

    if (!process.env.GEMINI_API_KEY) {
      return {
        assessment: 'Employee showing consistent performance.',
        improvements: ['Focus on team collaboration', 'Attend training programs'],
        rewardEligibility: 'Eligible for bonus based on performance',
        alerts: [],
        nextSteps: 'Schedule performance review with manager',
      };
    }

    // Example API call (uncomment and configure as needed)
    // const response = await axios.post(
    //   `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
    //   {
    //     contents: [{ parts: [{ text: prompt }] }],
    //   }
    // );
    // return response.data.candidates[0].content.parts[0].text;

    return {};
  } catch (error) {
    console.error('AI Service error:', error);
    return {};
  }
};

export default {
  getAIRecommendations,
  getBurnoutAnalysis,
  getRewardFairnessAnalysis,
};
