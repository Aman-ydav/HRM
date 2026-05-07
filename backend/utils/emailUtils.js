// utils/emailUtils.js
// Email Service Utility

import axios from 'axios';
import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config/email.js';

const hasBrevoConfig = Boolean(EMAIL_CONFIG.brevoApiKey);

// Create transporter only for legacy SMTP fallback
const transporter = hasBrevoConfig ? null : nodemailer.createTransport({
  service: EMAIL_CONFIG.service,
  auth: {
    user: EMAIL_CONFIG.auth.user,
    pass: EMAIL_CONFIG.auth.pass,
  },
});

const sendViaBrevo = async (to, subject, htmlContent) => {
  const response = await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: {
        email: EMAIL_CONFIG.from.includes('<')
          ? EMAIL_CONFIG.from.match(/<([^>]+)>/)?.[1] || EMAIL_CONFIG.from
          : EMAIL_CONFIG.from,
        name: EMAIL_CONFIG.from.includes('<')
          ? EMAIL_CONFIG.from.split('<')[0].trim()
          : 'HRM Reward System',
      },
      to: [{ email: to }],
      subject,
      htmlContent,
    },
    {
      headers: {
        'api-key': EMAIL_CONFIG.brevoApiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
    }
  );

  return response.data;
};

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    if (hasBrevoConfig) {
      const info = await sendViaBrevo(to, subject, htmlContent);
      console.log(`✓ Email sent via Brevo: ${info.messageId || 'ok'}`);
      return { success: true, info };
    }

    const mailOptions = {
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ Email sent: ${info.response}`);
    return { success: true, info };
  } catch (error) {
    console.error(`✗ Error sending email: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const htmlContent = `
    <h2>Welcome to HRM Reward System!</h2>
    <p>Hi ${name},</p>
    <p>Your account has been created successfully.</p>
    <p>You can now login and start tracking your rewards and performance.</p>
    <p>Best regards,<br>HRM Team</p>
  `;

  return sendEmail(email, 'Welcome to HRM Reward System', htmlContent);
};

export const sendRewardNotification = async (email, name, rewardType, details) => {
  const htmlContent = `
    <h2>🎉 Congratulations!</h2>
    <p>Hi ${name},</p>
    <p>You have been awarded with ${rewardType}!</p>
    <p><strong>Details:</strong> ${details}</p>
    <p>Keep up the great work!</p>
    <p>Best regards,<br>HRM Team</p>
  `;

  return sendEmail(email, 'Reward Notification', htmlContent);
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  const htmlContent = `
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password.</p>
    <p><a href="${resetLink}">Click here to reset your password</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Best regards,<br>HRM Team</p>
  `;

  return sendEmail(email, 'Password Reset Request', htmlContent);
};

export const sendFeedbackNotification = async (email, name, feedbackType) => {
  const htmlContent = `
    <h2>Feedback Received</h2>
    <p>Hi ${name},</p>
    <p>You have received new ${feedbackType} from your team.</p>
    <p>Please log in to view the feedback details.</p>
    <p>Best regards,<br>HRM Team</p>
  `;

  return sendEmail(email, 'Feedback Notification', htmlContent);
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendRewardNotification,
  sendPasswordResetEmail,
  sendFeedbackNotification,
};
