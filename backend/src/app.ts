import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import siteRoutes from './routes/siteRoutes.js';
import gpsRoutes from './routes/gpsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ============ ROUTES ============
app.post('/test-auth', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'EquipTrack API', 
    version: '1.0.0',
    docs: '/api/docs'
  });
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webAdminDist = path.resolve(__dirname, '../../web_admin/dist');

if (fs.existsSync(webAdminDist)) {
  app.use(express.static(webAdminDist));

  app.get((req: Request, res: Response) => {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ error: `Route ${req.originalUrl} not found` });
    }
    res.sendFile(path.join(webAdminDist, 'index.html'));
  });
} else {
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.originalUrl.startsWith('/api')) {
      console.warn(`Web admin UI not found at ${webAdminDist}; API only mode.`);
    }
    next();
  });
}

// 404 handler - FIXED: Use (req, res) instead of '*'
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;