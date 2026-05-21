import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import { createServer } from 'http';
import sequelize from './config/database.js';
import { initializeSocket } from './sockets/socketHandler.js';
import { startMQTT } from './mqtt/mqttBridge.js';
import { startMissionReminderScheduler } from './schedulers/missionReminderScheduler.js';

// src/index.js
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Create HTTP server
    const httpServer = createServer(app);
    
    // Initialize Socket.IO
    initializeSocket(httpServer);
    
    // Start MQTT Bridge
    startMQTT();
    startMissionReminderScheduler();

    // Sync database
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');
    console.log("TEST ENV:", process.cwd());
console.log("DB =", process.env.DATABASE_URL);
    // Start server
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 ErckTrack Backend -          Running               ║
║                                                          ║
║   📍 Server: http://localhost:${PORT}                   ║
║   💚 Health: http://localhost:${PORT}/health            ║
║   🔌 Socket.IO: Active                                  ║
║   📡 MQTT Bridge: Connected to ${process.env.MQTT_HOST || 'localhost'}:${process.env.MQTT_PORT || '1883'}
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();