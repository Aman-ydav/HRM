// controllers/rewardController.js
// Reward Controller

import Reward from '../models/Reward.js';
import Employee from '../models/Employee.js';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/responseUtils.js';
import { getPaginationParams } from '../utils/paginationUtils.js';
import { sendRewardNotification } from '../utils/emailUtils.js';

// Assign Reward
export const assignReward = async (req, res, next) => {
  try {
    const {
      employeeId,
      rewardType,
      points,
      bonus,
      badge,
      reason,
      criteria,
      month,
    } = req.body;

    // VALIDATION: Check required fields
    if (!employeeId || !rewardType || !reason) {
      return sendError(res, 'employeeId, rewardType, and reason are required', 400);
    }

    // VALIDATION: Validate rewardType enum
    const VALID_REWARD_TYPES = ['points', 'bonus', 'badge', 'employee_of_month'];
    if (!VALID_REWARD_TYPES.includes(rewardType)) {
      return sendError(res, `Invalid rewardType. Must be one of: ${VALID_REWARD_TYPES.join(', ')}`, 400);
    }

    // VALIDATION: Check valid points/bonus ranges
    if (points && (points < 0 || points > 500)) {
      return sendError(res, 'Points must be between 0-500', 400);
    }

    if (bonus && (bonus < 0 || bonus > 100000)) {
      return sendError(res, 'Bonus must be between 0-100000', 400);
    }

    // VALIDATION: Month format YYYY-MM
    if (month && !/^\d{4}-\d{2}$/.test(month)) {
      return sendError(res, 'Month must be in YYYY-MM format', 400);
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const reward = new Reward({
      employeeId,
      rewardType,
      points: points || 0,
      bonus: bonus || 0,
      badge: badge || null,
      reason,
      criteria: criteria || [],
      month: month || new Date().toISOString().slice(0, 7),
      awardedBy: req.userId,
      approvalStatus: 'pending',
    });

    await reward.save();

    // Send notification (non-blocking)
    sendRewardNotification(
      employee.email,
      `${employee.firstName} ${employee.lastName}`,
      rewardType,
      reason
    ).catch((err) => {
      console.warn('Reward notification email failed (non-critical):', err.message);
    });

    return sendSuccess(res, reward, 'Reward assigned successfully', 201);
  } catch (error) {
    console.error('Assign reward error:', error);
    next(error);
  }
};

// Approve Reward
export const approveReward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    // VALIDATION: Check required fields
    if (!approvalStatus) {
      return sendError(res, 'approvalStatus is required', 400);
    }

    // VALIDATION: Validate approvalStatus enum
    const VALID_STATUSES = ['approved', 'rejected', 'pending'];
    if (!VALID_STATUSES.includes(approvalStatus)) {
      return sendError(res, `Invalid approvalStatus. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }

    const reward = await Reward.findById(id);
    if (!reward) {
      return sendError(res, 'Reward not found', 404);
    }

    reward.approvalStatus = approvalStatus;
    reward.approvedBy = req.userId;
    reward.approvalDate = new Date();

    if (approvalStatus === 'approved') {
      // Update employee reward points and bonus
      const employee = await Employee.findById(reward.employeeId);
      if (!employee) {
        return sendError(res, 'Employee not found', 404);
      }

      employee.rewardPoints = (employee.rewardPoints || 0) + (reward.points || 0);
      employee.totalBonus = (employee.totalBonus || 0) + (reward.bonus || 0);

      // Add badge if applicable
      if (reward.badge && !employee.badges.includes(reward.badge)) {
        employee.badges.push(reward.badge);
      }

      await employee.save();
    }

    await reward.save();

    return sendSuccess(res, reward, 'Reward approval updated successfully', 200);
  } catch (error) {
    console.error('Approve reward error:', error);
    next(error);
  }
};

// Get Rewards
export const getRewards = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { page, limit, skip } = getPaginationParams(req.query);
    const { month, status } = req.query;

    // SECURITY: Employees can only view their own rewards
    if (req.userRole === 'employee') {
      const userEmployee = await Employee.findOne({ userId: req.userId });
      if (userEmployee._id.toString() !== employeeId) {
        return sendError(res, 'Not authorized to view other employees rewards', 403);
      }
    }

    // VALIDATION: Validate status if provided
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      return sendError(res, 'Invalid status. Must be pending, approved, or rejected', 400);
    }

    // VALIDATION: Validate month format if provided
    if (month && !/^\d{4}-\d{2}$/.test(month)) {
      return sendError(res, 'Month must be in YYYY-MM format', 400);
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    let query = { employeeId };

    if (month) query.month = month;
    if (status) query.approvalStatus = status;

    const total = await Reward.countDocuments(query);
    const rewards = await Reward.find(query)
      .skip(skip)
      .limit(limit)
      .populate('awardedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    return sendPaginatedResponse(res, rewards, page, limit, total, 'Rewards fetched successfully');
  } catch (error) {
    console.error('Get rewards error:', error);
    next(error);
  }
};

// Get Reward Leaderboard
export const getRewardLeaderboard = async (req, res, next) => {
  try {
    const { month, limit = 10 } = req.query;

    let query = { approvalStatus: 'approved' };

    if (month) {
      query.month = month;
    } else {
      query.month = new Date().toISOString().slice(0, 7);
    }

    const rewards = await Reward.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$employeeId',
          totalPoints: { $sum: '$points' },
          totalBonus: { $sum: '$bonus' },
          badges: { $push: '$badge' },
          rewardCount: { $sum: 1 },
        },
      },
      { $sort: { totalPoints: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $project: {
          _id: 0,
          employeeId: '$_id',
          name: {
            $concat: ['$employee.firstName', ' ', '$employee.lastName'],
          },
          email: '$employee.email',
          department: '$employee.department',
          totalPoints: 1,
          totalBonus: 1,
          rewardCount: 1,
          badges: 1,
        },
      },
    ]);

    return sendSuccess(res, rewards, 'Reward leaderboard fetched successfully', 200);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    next(error);
  }
};

// Get Bonus History
export const getBonusHistory = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { page, limit, skip } = getPaginationParams(req.query);

    // SECURITY: Employees can only view their own bonus history
    if (req.userRole === 'employee') {
      const userEmployee = await Employee.findOne({ userId: req.userId });
      if (userEmployee._id.toString() !== employeeId) {
        return sendError(res, 'Not authorized to view other employees bonus history', 403);
      }
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const total = await Reward.countDocuments({
      employeeId,
      rewardType: 'bonus',
      approvalStatus: 'approved',
    });

    const bonuses = await Reward.find({
      employeeId,
      rewardType: 'bonus',
      approvalStatus: 'approved',
    })
      .skip(skip)
      .limit(limit)
      .populate('awardedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    const totalBonus = bonuses.reduce((sum, b) => sum + (b.bonus || 0), 0);

    return sendPaginatedResponse(
      res,
      { bonuses, totalBonus },
      page,
      limit,
      total,
      'Bonus history fetched successfully'
    );
  } catch (error) {
    console.error('Get bonus history error:', error);
    next(error);
  }
};

// Get Rewards by Type
export const getRewardsByType = async (req, res, next) => {
  try {
    const { month } = req.query;

    let query = { approvalStatus: 'approved' };

    if (month) {
      query.month = month;
    } else {
      query.month = new Date().toISOString().slice(0, 7);
    }

    const byType = await Reward.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$rewardType',
          count: { $sum: 1 },
          totalValue: {
            $sum: {
              $cond: [
                { $eq: ['$rewardType', 'bonus'] },
                '$bonus',
                { $cond: [{ $eq: ['$rewardType', 'points'] }, '$points', 0] },
              ],
            },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return sendSuccess(res, byType, 'Rewards by type fetched successfully', 200);
  } catch (error) {
    console.error('Get rewards by type error:', error);
    next(error);
  }
};

export default {
  assignReward,
  approveReward,
  getRewards,
  getRewardLeaderboard,
  getBonusHistory,
  getRewardsByType,
};
