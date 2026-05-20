import { Router } from 'express';
import { ReportController } from '../controllers/reportController.js';
import { StatController } from '../controllers/statController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = Router();

router.use(authenticate);

// Report endpoints (admin only)
router.get('/missions', authorize('admin'), ReportController.getMissionReport);
router.get('/list', authorize('admin'), ReportController.getTechnicianReports);
router.get('/submitted/:missionId', ReportController.getSubmissionStatus);
router.get('/detail/:missionId', authorize('admin'), ReportController.getReportDetail);
router.get('/export/excel', authorize('admin'), ReportController.exportToExcel);

// Statistics endpoints (all authenticated users)
router.get('/stats/dashboard', StatController.getDashboardStats);
router.get('/stats/missions-per-day', StatController.getMissionsPerDay);
router.get('/stats/top-technicians', StatController.getTopTechnicians);
router.get('/stats/top-drivers', StatController.getTopDrivers);

export default router;