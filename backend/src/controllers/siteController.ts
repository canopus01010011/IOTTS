import type { Request, Response, NextFunction } from 'express';
import { SiteService } from '../services/siteService.js';

export class SiteController {
  static async createSite(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const site = await SiteService.createSite(req.body);
      res.status(201).json(site);
    } catch (error) {
      next(error);
    }
  }

  static async getAllSites(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SiteService.getAllSites(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getSiteById(req: Request, res: Response, next: NextFunction) {
    try {
      const site = await SiteService.getSiteById(req.params.id as string);
      res.json(site);
    } catch (error) {
      next(error);
    }
  }

  static async updateSite(req: Request, res: Response, next: NextFunction) {
    try {
      const site = await SiteService.updateSite(
        req.params.id as string,
        req.body,
        req.user?.role as string
      );
      res.json(site);
    } catch (error) {
      next(error);
    }
  }

  static async deleteSite(req: Request, res: Response, next: NextFunction) {
    try {
      await SiteService.deleteSite(req.params.id as string, req.user?.role as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}