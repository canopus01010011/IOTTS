import { Router } from 'express';
import { GPSController } from '../controllers/gpsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All GPS routes require authentication
router.use(authenticate);

// Get all equipment with live locations
router.get('/live', GPSController.getAllLiveLocations);

// Get GPS history for specific equipment
router.get('/equipment/:equipmentId/history', GPSController.getEquipmentHistory);

export default router;