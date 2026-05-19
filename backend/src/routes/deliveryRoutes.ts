import { Router } from 'express';
import { DeliveryController } from '../controllers/deliveryController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All delivery routes require authentication
router.use(authenticate);

// Scan QR code (driver or technician)
router.post('/scan', DeliveryController.scanQR);

// Get delivery status
router.get('/status/:missionId', DeliveryController.getDeliveryStatus);

export default router;