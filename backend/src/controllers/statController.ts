import type { Request, Response, NextFunction } from 'express';
import { StatService } from '../services/statService.js';

export class StatController {
  /**
   * GET /api/stats/dashboard
   */
  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await StatService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/stats/missions-per-day
   */
  static async getMissionsPerDay(req: Request, res: Response, next: NextFunction) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await StatService.getMissionsPerDay(days);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/stats/top-technicians
   */
  static async getTopTechnicians(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const data = await StatService.getTopTechnicians(limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/stats/top-drivers
   */
  static async getTopDrivers(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const data = await StatService.getTopDrivers(limit);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

}