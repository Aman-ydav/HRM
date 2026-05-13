import express from 'express';
import { getEmployeeReport, getDepartmentReport } from '../controllers/reportController.js';
import protect, { authorize } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Employee level report: protected - employees can fetch their own report, admins can fetch any
router.get('/employee/:employeeId', protect, cacheMiddleware(30), getEmployeeReport);

// Department level report: admin only
router.get('/department/:department', protect, authorize('admin'), cacheMiddleware(60), getDepartmentReport);

export default router;
