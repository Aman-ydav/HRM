// config/email.js
// Email Configuration

export const EMAIL_CONFIG = {
  brevoApiKey: process.env.BREVO_API_KEY || '',
  from: process.env.SMTP_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@hrm-reward-system.com',
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
};

export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'passwordReset',
  REWARD_NOTIFICATION: 'rewardNotification',
  ATTENDANCE_ALERT: 'attendanceAlert',
  PERFORMANCE_FEEDBACK: 'performanceFeedback',
};

export default EMAIL_CONFIG;
