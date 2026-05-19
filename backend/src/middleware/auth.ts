import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JwtPayload } from '../utils/jwt.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication required. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1]; ////modified to split the token from "Bearer " prefix
    if (!token) {
    return res.status(401).json({ message: "Token missing from header" });
}
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
    }

    req.user = decoded;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Optional: doesn't fail if no token
export const optionalAuth = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];////modified to split the token from "Bearer " prefix
      if (!token) {
    return res.status(401).json({ message: "Token missing from header" });
}
      const decoded = verifyToken(token);
      if (decoded) req.user = decoded;
    }
    next();
  } catch {
    next();
  }
};