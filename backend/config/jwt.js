// config/jwt.js
// JWT Configuration

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your_secret_key',
  expiresIn: process.env.JWT_EXPIRE || '7d',
  algorithm: 'HS256',
};

export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'resetPassword',
  EMAIL_VERIFICATION: 'emailVerification',
};

export default JWT_CONFIG;
