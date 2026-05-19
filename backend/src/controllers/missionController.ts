import type { Request, Response, NextFunction } from 'express';
import { MissionService } from '../services/missionService.js';

export class MissionController {
  static async createMission(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const mission = await MissionService.createMission(req.body);
      res.status(201).json(mission);
    } catch (error) {
      next(error);
    }
  }

  static async createMissionFromJson(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const result = await MissionService.createMissionFromJson(req.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getAllMissions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MissionService.getAllMissions(
        req.query,
        req.user?.role as string ,
        req.user?.id as string
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMissionById(req: Request, res: Response, next: NextFunction) {
    try {
      const mission = await MissionService.getMissionById(
        req.params.id as string,
        req.user?.role as string,
        req.user?.id as string
      );
      res.json(mission);
    } catch (error) {
      next(error);
    }
  }

  static async updateMission(req: Request, res: Response, next: NextFunction) {
    try {
      const mission = await MissionService.updateMission(
        req.params.id as string,
        req.body,
        req.user?.role as string
      );
      res.json(mission);
    } catch (error) {
      next(error);
    }
  }

  static async deleteMission(req: Request, res: Response, next: NextFunction) {
    try {
      await MissionService.deleteMission(req.params.id as string, req.user?.role as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const mission = await MissionService.updateStatus(
        req.params.id as string,
        status,
        req.user?.role as string,
        req.user?.id as string
      );
      res.json(mission);
    } catch (error) {
      next(error);
    }
  }
}
