import type { Request, Response, NextFunction } from 'express';
import { EquipmentService } from '../services/equipmentService.js';

export class EquipmentController {
  static async createEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const equipment = await EquipmentService.createEquipment(req.body);
      res.status(201).json(equipment);
    } catch (error) {
      next(error);
    }
  }

  static async getAllEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await EquipmentService.getAllEquipment(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getEquipmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const equipment = await EquipmentService.getEquipmentById(req.params.id as string);
      res.json(equipment);
    } catch (error) {
      next(error);
    }
  }

  static async updateEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const equipment = await EquipmentService.updateEquipment(
        req.params.id as string,
        req.body,
        req.user?.role as string
      );
      res.json(equipment);
    } catch (error) {
      next(error);
    }
  }

  static async deleteEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      await EquipmentService.deleteEquipment(req.params.id as string, req.user?.role as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}