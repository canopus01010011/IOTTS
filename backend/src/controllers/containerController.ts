import type { Request, Response, NextFunction } from 'express';
import { ContainerService } from '../services/containerService.js';

export class ContainerController {
  static async createContainer(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const container = await ContainerService.createContainer(req.body);
      res.status(201).json(container);
    } catch (error) {
      next(error);
    }
  }

  static async getAllContainers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ContainerService.getAllContainers(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getContainerById(req: Request, res: Response, next: NextFunction) {
    try {
      const container = await ContainerService.getContainerById(req.params.id as string);
      res.json(container);
    } catch (error) {
      next(error);
    }
  }

  static async updateContainer(req: Request, res: Response, next: NextFunction) {
    try {
      const container = await ContainerService.updateContainer(
        req.params.id as string,
        req.body,
        req.user?.role as string,
      );
      res.json(container);
    } catch (error) {
      next(error);
    }
  }

  static async deleteContainer(req: Request, res: Response, next: NextFunction) {
    try {
      await ContainerService.deleteContainer(req.params.id as string, req.user?.role as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
