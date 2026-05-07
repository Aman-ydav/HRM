// utils/calculationUtils.js
// Calculation Utilities for Attendance, Performance, and Rewards

export const calculateAttendancePercentage = (presentDays, totalDays) => {
  if (totalDays === 0) return 0;
  return Math.round((presentDays / totalDays) * 100);
};

export const calculatePerformanceScore = (
  taskCompletion,
  productivity,
  collaboration
) => {
  const score = (taskCompletion / 100) * 5 + (productivity + collaboration) / 2;
  return Math.round((score / 3) * 100) / 100;
};

export const calculateRewardPoints = (
  attendance,
  performanceScore,
  feedback
) => {
  let points = 0;

  // Attendance-based points (max 30)
  if (attendance >= 95) points += 30;
  else if (attendance >= 90) points += 25;
  else if (attendance >= 85) points += 20;
  else if (attendance >= 80) points += 15;

  // Performance-based points (max 40)
  if (performanceScore >= 4.5) points += 40;
  else if (performanceScore >= 4) points += 30;
  else if (performanceScore >= 3.5) points += 20;
  else if (performanceScore >= 3) points += 10;

  // Feedback-based points (max 30)
  if (feedback >= 4.5) points += 30;
  else if (feedback >= 4) points += 25;
  else if (feedback >= 3.5) points += 20;
  else if (feedback >= 3) points += 10;

  return Math.min(points, 100); // Cap at 100 points
};

export const calculateWorkingHours = (checkInTime, checkOutTime) => {
  if (!checkInTime || !checkOutTime) return 0;

  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);

  const diffMs = checkOut - checkIn;
  const diffHours = diffMs / (1000 * 60 * 60);

  return Math.round(diffHours * 100) / 100; // Round to 2 decimal places
};

export const isLateArrival = (checkInTime, officePolicyTime = 9) => {
  if (!checkInTime) return false;

  const checkIn = new Date(checkInTime);
  const hour = checkIn.getHours();

  return hour > officePolicyTime;
};

export const getLateMinutes = (checkInTime, officePolicyTime = 9) => {
  if (!checkInTime || !isLateArrival(checkInTime, officePolicyTime)) return 0;

  const checkIn = new Date(checkInTime);
  const policyTime = new Date(checkIn);
  policyTime.setHours(officePolicyTime, 0, 0, 0);

  const diffMs = checkIn - policyTime;
  return Math.ceil(diffMs / (1000 * 60)); // Return minutes
};

export const determineBadges = (attendance, performanceScore, feedback) => {
  const badges = [];

  if (attendance >= 95) badges.push('high_attendance');
  if (performanceScore >= 4) badges.push('high_productivity');
  if (feedback >= 4) badges.push('team_player');

  return badges;
};

export default {
  calculateAttendancePercentage,
  calculatePerformanceScore,
  calculateRewardPoints,
  calculateWorkingHours,
  isLateArrival,
  getLateMinutes,
  determineBadges,
};
