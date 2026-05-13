// models/Reward.js
// Reward Model for Managing Rewards, Bonuses, and Badges

import mongoose from 'mongoose';
import { REWARD_TYPE, BADGE_TYPES } from '../constants/index.js';

const rewardSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    rewardType: {
      type: String,
      enum: Object.values(REWARD_TYPE),
      required: true,
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0,
    },
    badge: {
      type: String,
      enum: Object.values(BADGE_TYPES),
      default: null,
    },
    reason: {
      type: String,
      required: true,
    },
    criteria: [
      {
        type: String,
      },
    ],
    awardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    month: {
      type: String, // Format: YYYY-MM
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
rewardSchema.index({ employeeId: 1 });
rewardSchema.index({ month: 1 });
rewardSchema.index({ rewardType: 1 });
rewardSchema.index({ approvalStatus: 1 });
rewardSchema.index({ employeeId: 1, month: 1 });

const Reward = mongoose.model('Reward', rewardSchema);
export default Reward;
