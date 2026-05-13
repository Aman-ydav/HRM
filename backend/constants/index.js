// constants/index.js
// Application Constants

export const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  HR_MANAGER: 'hr_manager',
};

export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on_leave',
  TERMINATED: 'terminated',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  ON_LEAVE: 'on_leave',
  HALF_DAY: 'half_day',
};

export const FEEDBACK_TYPE = {
  EMPLOYEE_FEEDBACK: 'employee_feedback',
  MANAGER_FEEDBACK: 'manager_feedback',
  PEER_REVIEW: 'peer_review',
  ANONYMOUS: 'anonymous',
};

export const REWARD_TYPE = {
  POINTS: 'points',
  BONUS: 'bonus',
  BADGE: 'badge',
  EMPLOYEE_OF_MONTH: 'employee_of_month',
  CERTIFICATE: 'certificate',
  PROMOTION: 'promotion',
  FLEXIBLE_TIME: 'flexible_time',
  LEARNING_BUDGET: 'learning_budget',
};

export const BADGE_TYPES = {
  EXCELLENCE: 'excellence',
  TEAMWORK: 'teamwork',
  INNOVATION: 'innovation',
  CUSTOMER_FOCUS: 'customer_focus',
  LEADERSHIP: 'leadership',
  GROWTH: 'growth',
  RELIABILITY: 'reliability',
  CREATIVITY: 'creativity',
  HIGH_ATTENDANCE: 'high_attendance',
  HIGH_PRODUCTIVITY: 'high_productivity',
  TEAM_PLAYER: 'team_player',
  INNOVATOR: 'innovator',
  LEADER: 'leader',
};

export const DEPARTMENTS = {
  ENGINEERING: 'Engineering',
  SALES: 'Sales',
  MARKETING: 'Marketing',
  OPERATIONS: 'Operations',
  HUMAN_RESOURCES: 'Human Resources',
  FINANCE: 'Finance',
};

export const PERFORMANCE_RATING = {
  POOR: 1,
  BELOW_AVERAGE: 2,
  AVERAGE: 3,
  GOOD: 4,
  EXCELLENT: 5,
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_SENT: 'Email sent successfully',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export default {
  ROLES,
  EMPLOYEE_STATUS,
  ATTENDANCE_STATUS,
  FEEDBACK_TYPE,
  REWARD_TYPE,
  BADGE_TYPES,
  PERFORMANCE_RATING,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PAGINATION,
};
