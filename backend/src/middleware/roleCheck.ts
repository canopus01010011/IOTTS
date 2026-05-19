import { type Request, type Response, type NextFunction } from 'express';

type UserRole = 'admin' | 'technician' | 'driver';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ 
        error: `Access denied. Requires role: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

// Convenience middleware
export const isAdmin = authorize('admin');
export const isTechnician = authorize('technician', 'admin');
export const isDriver = authorize('driver', 'admin');
export const isTechnicianOrDriver = authorize('technician', 'driver', 'admin');