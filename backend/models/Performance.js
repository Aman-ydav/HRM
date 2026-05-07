// models/Performance.js
// Performance Model for Employee Performance Tracking

import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    reviewPeriod: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    taskCompletionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    productivityScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    teamCollaborationScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    managerFeedback: {
      type: String,
      default: null,
    },
    monthlyRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    overallPerformance: {
      type: Number,
      min: 1,
      max: 5,
    },
    improvementAreas: [
      {
        type: String,
      },
    ],
    strengths: [
      {
        type: String,
      },
    ],
    goals: [
      {
        goal: String,
        status: {
          type: String,
          enum: ['pending', 'in_progress', 'completed'],
          default: 'pending',
        },
      },
    ],
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    comments: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
performanceSchema.index({ employeeId: 1 });
performanceSchema.index({ 'reviewPeriod.startDate': 1, 'reviewPeriod.endDate': 1 });
performanceSchema.index({ monthlyRating: 1 });

const Performance = mongoose.model('Performance', performanceSchema);
export default Performance;
