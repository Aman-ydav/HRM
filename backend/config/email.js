// config/email.js
// Email Configuration

const parseSenderFromAddress = (fromAddress = '') => {
  const value = String(fromAddress).trim();
  if (!value) {
    return { email: '', name: '' };
  }

  const match = value.match(/^(.*)<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].trim().replace(/^"|"$/g, ''),
      email: match[2].trim(),
    };
  }

  return { email: value, name: '' };
};

const legacySender = parseSenderFromAddress(
  process.env.SMTP_FROM_EMAIL || process.env.EMAIL_FROM || ''
);

export const EMAIL_CONFIG = {
  brevoApiKey: process.env.BREVO_API_KEY || '',
  senderEmail: process.env.BREVO_SENDER_EMAIL || legacySender.email || '',
  senderName: process.env.BREVO_SENDER_NAME || legacySender.name || 'HRM Reward System',
};

export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'passwordReset',
  REWARD_NOTIFICATION: 'rewardNotification',
  ATTENDANCE_ALERT: 'attendanceAlert',
  PERFORMANCE_FEEDBACK: 'performanceFeedback',
};

export default EMAIL_CONFIG;
