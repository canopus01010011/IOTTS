import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Mobile app - update FCM token
router.post('/token', NotificationController.updateToken);

// Get notifications
router.get('/', NotificationController.getNotifications);

// Get unread count
router.get('/unread/count', NotificationController.getUnreadCount);

// Mark as read
router.patch('/:id/read', NotificationController.markAsRead);

// Admin broadcast
router.post('/broadcast', authorize('admin'), NotificationController.sendBroadcast);

export default router;