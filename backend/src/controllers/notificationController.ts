import type { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService.js';

export class NotificationController {
  /**
   * POST /api/notifications/token
   * Update FCM token (mobile app calls this)
   */
  static async updateToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { fcmToken } = req.body;

      if (!fcmToken) {
        return res.status(400).json({ error: 'fcmToken is required' });
      }

      const result = await NotificationService.updateFCMToken(req.user?.id as string, fcmToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications
   * Get user's notifications
   */
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const unreadOnly = req.query.unread === 'true';

      const notifications = await NotificationService.getUserNotifications(
        req.user?.id as string,
        limit,
        unreadOnly
      );

      res.json({
        success: true,
        count: notifications.length,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/unread/count
   * Get unread notification count
   */
  static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NotificationService.getUnreadCount(req.user?.id as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark notification as read
   */
  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const notification = await NotificationService.markAsRead(id as string, req.user?.id as string);

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Notification not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }

  /**
   * POST /api/notifications/send (Admin only)
   * Send manual broadcast notification
   */
  static async sendBroadcast(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Only admins can broadcast' });
      }

      const { title, body, target, data } = req.body;

      if (!title || !body) {
        return res.status(400).json({ error: 'title and body are required' });
      }

      let result;

      if (target === 'all' || !target) {
        result = await NotificationService.sendToAll(title, body, data);
      } else if (target === 'technician') {
        result = await NotificationService.sendToRole('technician', title, body, data);
      } else if (target === 'driver') {
        result = await NotificationService.sendToRole('driver', title, body, data);
      } else if (target === 'admin') {
        result = await NotificationService.sendToRole('admin', title, body, data);
      } else {
        return res.status(400).json({ error: 'Invalid target. Use: all, technician, driver, admin' });
      }

      res.json({
        success: true,
        message: 'Broadcast sent',
        result,
      });
    } catch (error) {
      next(error);
    }
  }
}