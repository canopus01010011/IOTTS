import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';

let io: SocketServer | null = null;

export interface GpsUpdatePayload {
  gpsId: string;
  deviceSerial: string;
  containerId?: string;
  lat: number;
  lng: number;
  heading?: number;
  battery?: number;
}

export const initializeSocket = (server: HttpServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join-tracking', () => {
      socket.join('tracking');
      console.log(`📍 Client ${socket.id} joined tracking room`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitGPSUpdate = (payload: GpsUpdatePayload) => {
  if (!io) return;

  io.to('tracking').emit('gps-update', {
    equipmentId: payload.gpsId,
    equipmentName: payload.deviceSerial,
    containerId: payload.containerId,
    latitude: payload.lat,
    longitude: payload.lng,
    heading: payload.heading,
    battery: payload.battery,
    timestamp: new Date().toISOString(),
  });
};
