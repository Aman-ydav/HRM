// validations/employeeValidation.js
// Employee Validation Rules

import { body } from 'express-validator';

export const createEmployeeValidation = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required'),
  body('department')
    .notEmpty()
    .withMessage('Department is required'),
  body('position')
    .notEmpty()
    .withMessage('Position is required'),
  body('joiningDate')
    .isISO8601()
    .withMessage('Please provide a valid joining date'),
];

export const updateEmployeeValidation = [
  body('firstName')
    .optional()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  body('department')
    .optional()
    .notEmpty()
    .withMessage('Department cannot be empty'),
  body('position')
    .optional()
    .notEmpty()
    .withMessage('Position cannot be empty'),
];

export default {
  createEmployeeValidation,
  updateEmployeeValidation,
};
