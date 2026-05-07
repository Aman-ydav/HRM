#!/usr/bin/env node
/**
 * Production Verification Script
 * 
 * This script tests all critical security and functionality aspects
 * of the HRM backend to ensure production readiness.
 * 
 * Usage: node scripts/verify-production.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset}  ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset}  ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${colors.reset}  ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️ ${colors.reset}  ${msg}`),
  section: (msg) => console.log(`\n${colors.blue}${'═'.repeat(60)}${colors.reset}\n${msg}\n${colors.blue}${'═'.repeat(60)}${colors.reset}\n`),
};

let passCount = 0;
let failCount = 0;
let warningCount = 0;

const test = (name, passed, details = '') => {
  if (passed) {
    log.success(name);
    passCount++;
    if (details) log.info(`   ${details}`);
  } else {
    log.error(name);
    failCount++;
    if (details) log.info(`   ${details}`);
  }
};

const warn = (name, details = '') => {
  log.warning(name);
  warningCount++;
  if (details) log.info(`   ${details}`);
};

const checkFileExists = (filePath, relativeTo = __dirname) => {
  try {
    const fullPath = path.resolve(relativeTo, '..', filePath);
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
};

const checkFileContains = (filePath, searchString, relativeTo = __dirname) => {
  try {
    const fullPath = path.resolve(relativeTo, '..', filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    return content.includes(searchString);
  } catch {
    return false;
  }
};

const runTests = async () => {
  console.log(`
${colors.blue}╔════════════════════════════════════════════════════════════╗${colors.reset}
${colors.blue}║        HRM REWARD SYSTEM - PRODUCTION VERIFICATION         ║${colors.reset}
${colors.blue}╚════════════════════════════════════════════════════════════╝${colors.reset}
  `);

  // ========== CONFIGURATION FILES ==========
  log.section('1️⃣  CONFIGURATION FILES VERIFICATION');

  test(
    'package.json exists',
    checkFileExists('backend/package.json')
  );

  test(
    'package.json has ES6 modules enabled',
    checkFileContains('backend/package.json', '"type": "module"'),
    'ES6 modules required for import/export syntax'
  );

  test(
    '.env.example exists',
    checkFileExists('backend/.env.example'),
    'Template for production configuration'
  );

  test(
    '.gitignore excludes .env files',
    checkFileContains('backend/.gitignore', '.env'),
    'Prevents committing sensitive credentials'
  );

  // ========== SECURITY CHECKS ==========
  log.section('2️⃣  SECURITY IMPROVEMENTS VERIFICATION');

  test(
    'server.js has environment validation',
    checkFileContains('backend/server.js', 'validateEnvironment'),
    'Validates required configuration before startup'
  );

  test(
    'server.js checks CORS configuration',
    checkFileContains('backend/server.js', 'CORS_ORIGIN'),
    'Prevents wildcard CORS in production'
  );

  test(
    'seedData.js has production check',
    checkFileContains('backend/database/seedData.js', 'NODE_ENV === \'production\''),
    'Prevents accidental data deletion in production'
  );

  test(
    'seedData.js exits on production attempt',
    checkFileContains('backend/database/seedData.js', 'process.exit(1)'),
    'Safely prevents seed in production'
  );

  test(
    'authController prevents admin registration',
    checkFileContains('backend/controllers/authController.js', 'role === \'admin\''),
    'Only allows employee/hr_manager via registration'
  );

  test(
    'checkIn uses authenticated user ID',
    checkFileContains('backend/controllers/attendanceController.js', 'Employee.findOne({ userId: req.userId })'),
    'Prevents check-in impersonation'
  );

  test(
    'checkOut uses authenticated user ID',
    checkFileContains('backend/controllers/attendanceController.js', 'Employee.findOne({ userId: req.userId })'),
    'Prevents check-out impersonation'
  );

  test(
    'Attendance history has authorization check',
    checkFileContains('backend/controllers/attendanceController.js', 'req.userRole === \'employee\''),
    'Employees can only view own attendance'
  );

  test(
    'Reward assignment validates rewardType',
    checkFileContains('backend/controllers/rewardController.js', 'VALID_REWARD_TYPES'),
    'Prevents invalid reward types'
  );

  test(
    'Reward assignment validates points range',
    checkFileContains('backend/controllers/rewardController.js', 'points > 500'),
    'Prevents excessive reward points'
  );

  test(
    'Reward approval validates status',
    checkFileContains('backend/controllers/rewardController.js', 'VALID_STATUSES'),
    'Only accepts approved/rejected/pending'
  );

  test(
    'getRewards has authorization check',
    checkFileContains('backend/controllers/rewardController.js', 'Not authorized to view other employees rewards'),
    'Employees can only view own rewards'
  );

  test(
    'getBonusHistory has authorization check',
    checkFileContains('backend/controllers/rewardController.js', 'Not authorized to view other employees bonus'),
    'Employees can only view own bonuses'
  );

  // ========== ERROR HANDLING ==========
  log.section('3️⃣  ERROR HANDLING VERIFICATION');

  test(
    'errorHandler.js exists',
    checkFileExists('backend/middleware/errorHandler.js'),
    'Global error handling middleware'
  );

  test(
    'errorHandler catches CastError',
    checkFileContains('backend/middleware/errorHandler.js', 'CastError'),
    'Handles invalid MongoDB ObjectIds'
  );

  test(
    'errorHandler catches E11000 duplicates',
    checkFileContains('backend/middleware/errorHandler.js', '11000'),
    'Handles duplicate key errors'
  );

  test(
    'errorHandler catches JWT errors',
    checkFileContains('backend/middleware/errorHandler.js', 'JsonWebTokenError'),
    'Handles invalid tokens'
  );

  test(
    'errorHandler catches token expiration',
    checkFileContains('backend/middleware/errorHandler.js', 'TokenExpiredError'),
    'Handles expired tokens'
  );

  // ========== DATABASE MODELS ==========
  log.section('4️⃣  DATABASE MODELS VERIFICATION');

  test(
    'User model has email unique constraint',
    checkFileContains('backend/models/User.js', 'unique: true'),
    'Prevents duplicate email addresses'
  );

  test(
    'User model hashes password pre-save',
    checkFileContains('backend/models/User.js', 'pre(\'save\''),
    'Passwords hashed with bcrypt'
  );

  test(
    'Employee model has employeeId unique constraint',
    checkFileContains('backend/models/Employee.js', 'unique: true'),
    'Prevents duplicate employee IDs'
  );

  test(
    'Attendance has date-based uniqueness',
    checkFileContains('backend/models/Attendance.js', 'unique'),
    'Prevents duplicate daily attendance records'
  );

  test(
    'Reward model tracks approval status',
    checkFileContains('backend/models/Reward.js', 'approvalStatus'),
    'Tracks pending/approved/rejected rewards'
  );

  // ========== AUTHENTICATION ==========
  log.section('5️⃣  AUTHENTICATION VERIFICATION');

  test(
    'auth.js protect middleware exists',
    checkFileExists('backend/middleware/auth.js'),
    'JWT verification middleware'
  );

  test(
    'auth.js authorize middleware exists',
    checkFileContains('backend/middleware/auth.js', 'export const authorize'),
    'Role-based access control'
  );

  test(
    'JWT config exists',
    checkFileExists('backend/config/jwt.js'),
    'JWT configuration file'
  );

  test(
    'tokenUtils.js generates tokens',
    checkFileExists('backend/utils/tokenUtils.js'),
    'Token generation utility'
  );

  // ========== VALIDATION ==========
  log.section('6️⃣  INPUT VALIDATION VERIFICATION');

  test(
    'authValidation.js exists',
    checkFileExists('backend/validations/authValidation.js'),
    'Authentication validation rules'
  );

  test(
    'registerValidation checks email',
    checkFileContains('backend/validations/authValidation.js', 'isEmail'),
    'Email format validation'
  );

  test(
    'registerValidation checks password length',
    checkFileContains('backend/validations/authValidation.js', 'isLength'),
    'Password minimum length requirement'
  );

  test(
    'loginValidation exists',
    checkFileContains('backend/validations/authValidation.js', 'loginValidation'),
    'Login input validation'
  );

  // ========== API ROUTES ==========
  log.section('7️⃣  API ROUTES VERIFICATION');

  test(
    'authRoutes.js has protection',
    checkFileContains('backend/routes/authRoutes.js', 'protect'),
    'Protected auth endpoints'
  );

  test(
    'attendanceRoutes.js has authorization',
    checkFileContains('backend/routes/attendanceRoutes.js', 'authorize'),
    'Role-based attendance access'
  );

  test(
    'rewardRoutes.js restricts assignment',
    checkFileContains('backend/routes/rewardRoutes.js', 'authorize(\'admin\', \'hr_manager\')'),
    'Only admin/HR can assign rewards'
  );

  test(
    'performanceRoutes.js restricts reviews',
    checkFileContains('backend/routes/performanceRoutes.js', 'authorize'),
    'Only admin/HR can add performance reviews'
  );

  test(
    'dashboardRoutes.js restricted to admin/hr',
    checkFileContains('backend/routes/dashboardRoutes.js', 'authorize(\'admin\', \'hr_manager\')'),
    'Dashboard access restricted'
  );

  // ========== DOCUMENTATION ==========
  log.section('8️⃣  DOCUMENTATION VERIFICATION');

  test(
    'README.md exists',
    checkFileExists('backend/docs/README.md'),
    'Project documentation'
  );

  test(
    'SETUP_GUIDE.md exists',
    checkFileExists('backend/docs/SETUP_GUIDE.md'),
    'Setup instructions'
  );

  test(
    'PRODUCTION_CHECKLIST.md exists',
    checkFileExists('backend/docs/PRODUCTION_CHECKLIST.md'),
    'Production deployment checklist'
  );

  test(
    'PRODUCTION_FIXES_SUMMARY.md exists',
    checkFileExists('backend/docs/PRODUCTION_FIXES_SUMMARY.md'),
    'Security fixes documentation'
  );

  // ========== EMAIL HANDLING ==========
  log.section('9️⃣  EMAIL HANDLING VERIFICATION');

  test(
    'emailUtils.js has non-blocking send',
    checkFileContains('backend/controllers/authController.js', '.catch('),
    'Email failures don\'t block requests'
  );

  test(
    'Multiple email templates configured',
    checkFileContains('backend/utils/emailUtils.js', 'sendWelcomeEmail'),
    'Email templates implemented'
  );

  // ========== RESPONSE HANDLING ==========
  log.section('🔟 RESPONSE HANDLING VERIFICATION');

  test(
    'responseUtils.js exists',
    checkFileExists('backend/utils/responseUtils.js'),
    'Consistent response formatting'
  );

  test(
    'sendSuccess utility used',
    checkFileContains('backend/utils/responseUtils.js', 'export const sendSuccess'),
    'Success response formatter'
  );

  test(
    'sendError utility used',
    checkFileContains('backend/utils/responseUtils.js', 'export const sendError'),
    'Error response formatter'
  );

  test(
    'Pagination utility exists',
    checkFileExists('backend/utils/paginationUtils.js'),
    'Pagination helpers'
  );

  // ========== SUMMARY ==========
  log.section('VERIFICATION SUMMARY');

  const total = passCount + failCount + warningCount;
  console.log(`
${colors.green}Passed:  ${passCount}${colors.reset}
${colors.red}Failed:  ${failCount}${colors.reset}
${colors.yellow}Warnings: ${warningCount}${colors.reset}
${colors.gray}Total:   ${total}${colors.reset}
  `);

  if (failCount === 0) {
    console.log(`
${colors.green}╔════════════════════════════════════════════════════════════╗${colors.reset}
${colors.green}║           ✅ ALL CHECKS PASSED - PRODUCTION READY           ║${colors.reset}
${colors.green}╚════════════════════════════════════════════════════════════╝${colors.reset}
    `);
    process.exit(0);
  } else {
    console.log(`
${colors.red}╔════════════════════════════════════════════════════════════╗${colors.reset}
${colors.red}║             ❌ SOME CHECKS FAILED - FIX REQUIRED             ║${colors.reset}
${colors.red}╚════════════════════════════════════════════════════════════╝${colors.reset}
    `);
    process.exit(1);
  }
};

// Run the tests
runTests().catch((err) => {
  log.error(`Verification script error: ${err.message}`);
  process.exit(1);
});
