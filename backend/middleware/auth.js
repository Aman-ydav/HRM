// middleware/auth.js
// Authentication Middleware

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_CONFIG } from '../config/jwt.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token found',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_CONFIG.secret);
    req.userId = decoded.id;
    req.userRole = decoded.role;

    // Get user details
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// Role-based access control
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - insufficient permissions',
      });
    }
    next();
  };
};

export default protect;
