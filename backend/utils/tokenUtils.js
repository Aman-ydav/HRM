// utils/tokenUtils.js
// JWT Token Generation and Verification Utilities

import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.js';

export const generateToken = (id, role, expiresIn = JWT_CONFIG.expiresIn) => {
  return jwt.sign({ id, role }, JWT_CONFIG.secret, {
    expiresIn,
    algorithm: JWT_CONFIG.algorithm,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_CONFIG.secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const generateResetToken = () => {
  return require('crypto').randomBytes(20).toString('hex');
};

export const getTokenExpiry = (expiresIn = JWT_CONFIG.expiresIn) => {
  const expiryMs = parseExpiry(expiresIn);
  return new Date(Date.now() + expiryMs);
};

const parseExpiry = (expiresIn) => {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1));

  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * (units[unit] || 0);
};

export default {
  generateToken,
  verifyToken,
  generateResetToken,
  getTokenExpiry,
};
