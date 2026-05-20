import { Router } from 'express';
import { GPSController } from '../controllers/gpsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All GPS routes require authentication
router.use(authenticate);

// Get all equipment with live locations
router.get('/live', GPSController.getAllLiveLocations);

// Live position + trail for a mission container
router.get('/container/:containerId/live', GPSController.getContainerLive);
router.get('/container/:containerId/history', GPSController.getContainerHistory);

// Get GPS history for specific equipment (gps_id)
router.get('/equipment/:equipmentId/history', GPSController.getEquipmentHistory);

export default router;