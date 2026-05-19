import mqtt from 'mqtt';
import { mqttConfig } from '../config/mqttConfig.js';
import { GPSService } from '../services/gpsService.js';
import { emitGPSUpdate } from '../sockets/socketHandler.js';

let client: mqtt.MqttClient | null = null;

export const startMQTT = () => {
  const brokerUrl = `${mqttConfig.protocol}://${mqttConfig.host}:${mqttConfig.port}`;
  
  console.log(`📡 Connecting to MQTT broker: ${brokerUrl}`);
  
  client = mqtt.connect(brokerUrl, {
    clientId: mqttConfig.clientId,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
  });

  client.on('connect', () => {
    console.log('✅ MQTT Connected to broker');
    
    // Subscribe to all GPS topics (format: gps/DEVICE_ID)
    client?.subscribe('gps/+', { qos: 1 }, (err) => {
      if (err) {
        console.error('❌ Failed to subscribe to gps/+:', err);
      } else {
        console.log('✅ Subscribed to topic: gps/+');
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      
      // Extract device_id from topic (gps/ESP32-001 -> ESP32-001)
      const deviceId = topic.split('/')[1];
      
      if (!deviceId) {
        console.error('❌ Invalid topic format:', topic);
        return;
      }

      // Extract GPS coordinates (support both lat/lng and latitude/longitude)
      const lat = payload.lat || payload.latitude;
      const lng = payload.lng || payload.longitude;
      
      if (!lat || !lng) {
        console.error('❌ Invalid GPS data: missing lat/lng', payload);
        return;
      }

      console.log(`📡 GPS data from ${deviceId}: ${lat}, ${lng}`);

      // Save to database
      const result = await GPSService.saveGPSData({
        device_id: deviceId,
        lat: lat,
        lng: lng,
        speed: payload.speed,
        heading: payload.heading,
        timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),////undefinedmodified
      });

      // Emit real-time update via Socket.IO
      if (result && result.gpsId) {
        emitGPSUpdate(result.gpsId, deviceId, result.lat, result.lng);
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
