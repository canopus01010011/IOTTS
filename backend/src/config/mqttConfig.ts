import dotenv from 'dotenv';
dotenv.config();

export const mqttConfig = {
  host: process.env.MQTT_HOST || 'localhost',
  port: parseInt(process.env.MQTT_PORT || '1883', 10),
  protocol: 'mqtt' as const,
  clientId: `equiptrack-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
  username: process.env.MQTT_USERNAME || undefined,
  password: process.env.MQTT_PASSWORD || undefined,
};
