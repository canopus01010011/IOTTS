import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';

export class UserController {
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: only admins can create users' });
      }
      const user = await UserService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const result = await UserService.getAllUsers(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      if (req.user?.role !== 'admin' && req.user?.id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const user = await UserService.getUserById(userId as string);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      if (req.user?.role !== 'admin' && req.user?.id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const updated = await UserService.updateUser(userId as string, req.body);
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      await UserService.deleteUser(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}