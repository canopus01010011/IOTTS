import mqtt from 'mqtt';
import { mqttConfig } from '../config/mqttConfig.js';
import { GPSService } from '../services/gpsService.js';
import { emitGPSUpdate } from '../sockets/socketHandler.js';

let client: mqtt.MqttClient | null = null;

const SUBSCRIBE_TOPICS = [
  'gps/+',
  process.env.MQTT_TOPIC_PATTERN || 'ericsson/sites/+/+/gps',
];

/** Extract device serial from gps/DEVICE_ID or ericsson/sites/{site}/{device}/gps */
function parseDeviceIdFromTopic(topic: string): string | null {
  const parts = topic.split('/').filter(Boolean);

  if (parts[0] === 'gps' && parts.length >= 2) {
    return parts[1];
  }

  if (parts[0] === 'ericsson' && parts[1] === 'sites' && parts.length >= 5 && parts[4] === 'gps') {
    return parts[3];
  }

  return null;
}

export const startMQTT = () => {
  const brokerUrl = `${mqttConfig.protocol}://${mqttConfig.host}:${mqttConfig.port}`;

  console.log(`📡 Connecting to MQTT broker: ${brokerUrl}`);

  client = mqtt.connect(brokerUrl, {
    clientId: mqttConfig.clientId,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
    username: mqttConfig.username,
    password: mqttConfig.password,
  });

  client.on('connect', () => {
    console.log('✅ MQTT Connected to broker');

    SUBSCRIBE_TOPICS.forEach((topic) => {
      client?.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`❌ Failed to subscribe to ${topic}:`, err);
        } else {
          console.log(`✅ Subscribed to topic: ${topic}`);
        }
      });
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      const deviceId = parseDeviceIdFromTopic(topic);

      if (!deviceId) {
        console.error('❌ Invalid topic format:', topic);
        return;
      }

      const lat = payload.lat ?? payload.latitude;
      const lng = payload.lng ?? payload.longitude;

      if (lat == null || lng == null) {
        console.error('❌ Invalid GPS data: missing lat/lng', payload);
        return;
      }

      console.log(`📡 GPS [${topic}] ${deviceId}: ${lat}, ${lng}`);

      const result = await GPSService.saveGPSData({
        device_id: deviceId,
        lat: Number(lat),
        lng: Number(lng),
        speed: payload.speed != null ? Number(payload.speed) : undefined,
        heading: payload.heading != null ? Number(payload.heading) : undefined,
        battery: payload.battery != null ? Number(payload.battery) : undefined,
        timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      });

      if (result) {
        emitGPSUpdate({
          gpsId: result.gpsId,
          deviceSerial: result.deviceSerial,
          containerId: result.containerId ?? undefined,
          lat: result.lat,
          lng: result.lng,
          heading: result.heading,
          battery: result.battery,
        });
      }
    } catch (error) {
      console.error('❌ Error processing MQTT message:', error);
    }
  });

  client.on('error', (error) => {
    console.error('❌ MQTT Error:', error);
  });

  client.on('reconnect', () => {
    console.log('🔄 MQTT Reconnecting...');
  });

  client.on('offline', () => {
    console.warn('⚠️ MQTT Offline');
  });
};

export const stopMQTT = () => {
  if (client) {
    client.end();
    client = null;
    console.log('📡 MQTT disconnected');
  }
};
