// models/Feedback.js
// Feedback Model for Employee and Manager Feedback

import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    feedbackType: {
      type: String,
      enum: ['employee_feedback', 'manager_feedback', 'peer_review', 'anonymous'],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
    },
    category: {
      type: String,
      enum: ['work_quality', 'collaboration', 'communication', 'attendance', 'other'],
      default: 'other',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    isPositive: {
      type: Boolean,
      default: true,
    },
    actionItems: [
      {
        item: String,
        priority: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium',
        },
        status: {
          type: String,
          enum: ['pending', 'in_progress', 'completed'],
          default: 'pending',
        },
      },
    ],
    followUpDate: {
      type: Date,
      default: null,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolutionDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
feedbackSchema.index({ receiver: 1 });
feedbackSchema.index({ sender: 1 });
feedbackSchema.index({ feedbackType: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ receiver: 1, createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
