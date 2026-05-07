// controllers/feedbackController.js
// Feedback Controller

import Feedback from '../models/Feedback.js';
import Employee from '../models/Employee.js';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/responseUtils.js';
import { getPaginationParams } from '../utils/paginationUtils.js';
import { sendFeedbackNotification } from '../utils/emailUtils.js';

// Submit Feedback
export const submitFeedback = async (req, res, next) => {
  try {
    const {
      receiverId,
      feedbackType,
      rating,
      comment,
      category,
      isAnonymous,
      actionItems,
    } = req.body;

    const receiver = await Employee.findById(receiverId);
    if (!receiver) {
      return sendError(res, 'Recipient not found', 404);
    }

    const feedback = new Feedback({
      sender: req.userId,
      receiver: receiverId,
      feedbackType,
      rating,
      comment,
      category,
      isAnonymous: isAnonymous || false,
      isPositive: rating >= 3,
      actionItems,
    });

    await feedback.save();

    // Send notification
    await sendFeedbackNotification(
      receiver.email,
      `${receiver.firstName} ${receiver.lastName}`,
      feedbackType
    );

    return sendSuccess(res, feedback, 'Feedback submitted successfully', 201);
  } catch (error) {
    console.error('Submit feedback error:', error);
    next(error);
  }
};

// Get Feedback for Employee
export const getEmployeeFeedback = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { page, limit, skip } = getPaginationParams(req.query);
    const { feedbackType, isAnonymous } = req.query;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    let query = { receiver: employeeId };

    if (feedbackType) query.feedbackType = feedbackType;
    if (isAnonymous !== undefined) query.isAnonymous = isAnonymous === 'true';

    const total = await Feedback.countDocuments(query);
    const feedbacks = await Feedback.find(query)
      .skip(skip)
      .limit(limit)
      .populate('sender', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return sendPaginatedResponse(
      res,
      feedbacks,
      page,
      limit,
      total,
      'Feedback fetched successfully'
    );
  } catch (error) {
    console.error('Get feedback error:', error);
    next(error);
  }
};

// Get Feedback Given by Employee
export const getFeedbackGiven = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { page, limit, skip } = getPaginationParams(req.query);

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const total = await Feedback.countDocuments({ sender: employeeId });
    const feedbacks = await Feedback.find({ sender: employeeId })
      .skip(skip)
      .limit(limit)
      .populate('receiver', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return sendPaginatedResponse(
      res,
      feedbacks,
      page,
      limit,
      total,
      'Given feedback fetched successfully'
    );
  } catch (error) {
    console.error('Get given feedback error:', error);
    next(error);
  }
};

// Delete Feedback
export const deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return sendError(res, 'Feedback not found', 404);
    }

    // Check if user is feedback sender or admin
    if (
      feedback.sender.toString() !== req.userId &&
      req.userRole !== 'admin'
    ) {
      return sendError(res, 'Not authorized to delete this feedback', 403);
    }

    await Feedback.findByIdAndDelete(id);

    return sendSuccess(res, null, 'Feedback deleted successfully', 200);
  } catch (error) {
    console.error('Delete feedback error:', error);
    next(error);
  }
};

// Get Feedback Analytics
export const getFeedbackAnalytics = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const feedbacks = await Feedback.find({ receiver: employeeId });

    if (feedbacks.length === 0) {
      return sendSuccess(res, {}, 'No feedback data available', 200);
    }

    const averageRating =
      feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
    const positiveCount = feedbacks.filter((f) => f.isPositive).length;
    const negativeCount = feedbacks.filter((f) => !f.isPositive).length;

    const byCategory = {};
    feedbacks.forEach((f) => {
      if (!byCategory[f.category]) {
        byCategory[f.category] = { count: 0, averageRating: 0, ratings: [] };
      }
      byCategory[f.category].count += 1;
      byCategory[f.category].ratings.push(f.rating);
    });

    // Calculate average rating for each category
    for (const category in byCategory) {
      byCategory[category].averageRating =
        Math.round(
          (byCategory[category].ratings.reduce((a, b) => a + b, 0) /
            byCategory[category].ratings.length) *
            100
        ) / 100;
      delete byCategory[category].ratings;
    }

    const analytics = {
      totalFeedback: feedbacks.length,
      averageRating: Math.round(averageRating * 100) / 100,
      positiveCount,
      negativeCount,
      positivePercentage: Math.round((positiveCount / feedbacks.length) * 100),
      byCategory,
    };

    return sendSuccess(res, analytics, 'Feedback analytics fetched successfully', 200);
  } catch (error) {
    console.error('Get analytics error:', error);
    next(error);
  }
};

// Update Feedback Status
export const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isResolved, actionItems } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return sendError(res, 'Feedback not found', 404);
    }

    if (isResolved !== undefined) {
      feedback.isResolved = isResolved;
      if (isResolved) {
        feedback.resolutionDate = new Date();
      }
    }

    if (actionItems) {
      feedback.actionItems = actionItems;
    }

    await feedback.save();

    return sendSuccess(res, feedback, 'Feedback updated successfully', 200);
  } catch (error) {
    console.error('Update feedback error:', error);
    next(error);
  }
};

export default {
  submitFeedback,
  getEmployeeFeedback,
  getFeedbackGiven,
  deleteFeedback,
  getFeedbackAnalytics,
  updateFeedbackStatus,
};
