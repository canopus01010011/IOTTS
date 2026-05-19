import type { Request, Response, NextFunction } from 'express';
import { DeliveryService } from '../services/deliveryService.js';

export class DeliveryController {
  /**
   * POST /api/deliveries/scan
   * Process QR scan (driver or technician)
   */
  static async scanQR(req: Request, res: Response, next: NextFunction) {
    try {
      const { missionId } = req.body;

      // Validation
      if (!missionId) {
        return res.status(400).json({ error: 'missionId is required' });
      }
      const result = await DeliveryService.processScan({
        missionId,
        userId: req.user?.id as string ,
        userRole: req.user?.role as any,
      });

      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not assigned')) {
          return res.status(403).json({ error: error.message });
        }
        if (error.message.includes('already confirmed')) {
          return res.status(409).json({ error: error.message });
        }
        if (error.message.includes('must confirm')) {
          return res.status(400).json({ error: error.message });
        }
        if (error.message.includes('Invalid')) {
          return res.status(404).json({ error: error.message });
        }
      }
      next(error);
    }
  }

  /**
   * GET /api/deliveries/status/:missionId
   * Get delivery status for a mission
   */
  static async getDeliveryStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { missionId } = req.params;

      if (!missionId) {
        return res.status(400).json({ error: 'missionId is required' });
      }

      const status = await DeliveryService.getDeliveryStatus(
        missionId as string ,
        req.user?.id as string,
        req.user?.role as any
      ) ;

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not authorized')) {
          return res.status(403).json({ error: error.message });
        }
        if (error.message.includes('not found')) {
          return res.status(404).json({ error: error.message });
        }
      }
      next(error);
    }
  }
}
