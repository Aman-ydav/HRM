// config/email.js
// Email Configuration for Nodemailer

export const EMAIL_CONFIG = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  from: process.env.EMAIL_FROM || 'noreply@hrm-reward-system.com',
};

export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'passwordReset',
  REWARD_NOTIFICATION: 'rewardNotification',
  ATTENDANCE_ALERT: 'attendanceAlert',
  PERFORMANCE_FEEDBACK: 'performanceFeedback',
};

export default EMAIL_CONFIG;
