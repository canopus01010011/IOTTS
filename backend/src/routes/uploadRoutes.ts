import { Router } from 'express';
import { UploadController } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadSingle, uploadMultiple } from '../middleware/upload.js';

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// Single photo upload for equipment
router.post('/equipment/:equipmentId', uploadSingle, UploadController.uploadEquipmentPhoto);

// Single photo upload for delivery proof
router.post('/delivery/:missionId', uploadSingle, UploadController.uploadDeliveryPhoto);

// Validate only (no upload)
router.post('/validate', uploadSingle, UploadController.validateOnly);

// Multiple photos upload
router.post('/multiple', uploadMultiple, UploadController.uploadMultiplePhotos);

export default router;