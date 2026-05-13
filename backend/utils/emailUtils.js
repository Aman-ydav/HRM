// utils/emailUtils.js
// Email Service Utility

import 'dotenv/config';
import brevoPkg from '@getbrevo/brevo';
import { EMAIL_CONFIG } from '../config/email.js';

const { TransactionalEmailsApi } = brevoPkg;
const SendSmtpEmail = brevoPkg.SendSmtpEmail || brevoPkg.CreateSmtpEmail;

const brevoApi = new TransactionalEmailsApi();

if (EMAIL_CONFIG.brevoApiKey) {
  brevoApi.apiClient.authentications['api-key'].apiKey = EMAIL_CONFIG.brevoApiKey;
}

const normalizeRecipients = (to) =>
  Array.isArray(to) ? to.map((email) => ({ email })) : [{ email: to }];

export const sendEmail = async ({ to, subject, htmlContent, textContent }) => {
  try {
    if (!EMAIL_CONFIG.brevoApiKey) {
      throw new Error('Missing BREVO_API_KEY');
    }

    if (!EMAIL_CONFIG.senderEmail) {
      throw new Error('Missing sender email. Set BREVO_SENDER_EMAIL or SMTP_FROM_EMAIL');
    }

    const message = new SendSmtpEmail();
    message.sender = {
      email: EMAIL_CONFIG.senderEmail,
      name: EMAIL_CONFIG.senderName || 'HRM Reward System',
    };
    message.to = normalizeRecipients(to);
    message.subject = subject;

    if (htmlContent) message.htmlContent = htmlContent;
    if (textContent) message.textContent = textContent;

    const response = await brevoApi.sendTransacEmail(message);
    console.log('✓ Email sent via Brevo SDK');
    return { success: true, info: response?.body || response, provider: 'brevo_sdk' };
  } catch (error) {
    const errorMessage =
      error?.response?.body?.message ||
      error?.response?.text ||
      error?.body?.message ||
      error?.message ||
      'Unknown email provider error';

    console.error(`✗ Error sending email: ${errorMessage}`);
    return { success: false, error: errorMessage, provider: 'brevo_sdk' };
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

  return sendEmail({
    to: email,
    subject: 'Welcome to HRM Reward System',
    htmlContent,
  });
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

  return sendEmail({
    to: email,
    subject: 'Reward Notification',
    htmlContent,
  });
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

  return sendEmail({
    to: email,
    subject: 'Password Reset Request',
    htmlContent,
  });
};

export const sendFeedbackNotification = async (email, name, feedbackType) => {
  const htmlContent = `
    <h2>Feedback Received</h2>
    <p>Hi ${name},</p>
    <p>You have received new ${feedbackType} from your team.</p>
    <p>Please log in to view the feedback details.</p>
    <p>Best regards,<br>HRM Team</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Feedback Notification',
    htmlContent,
  });
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendRewardNotification,
  sendPasswordResetEmail,
  sendFeedbackNotification,
};
