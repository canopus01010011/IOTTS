import type { Request, Response, NextFunction } from 'express';
import { GPSService } from '../services/gpsService.js';

export class GPSController {
  static async getEquipmentHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { equipmentId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      
      const history = await GPSService.getEquipmentHistory(equipmentId as string , limit);
      
      res.json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllLiveLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const locations = await GPSService.getAllLiveLocations();
      
      res.json({
        success: true,
        count: locations.length,
        data: locations,
      });
    } catch (error) {
      next(error);
    }
  }
}