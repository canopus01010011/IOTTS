import mqtt from 'mqtt';
import { GPSDevice } from '../models/index.js';
import { mqttConfig } from '../config/mqttConfig.js';
import { WAREHOUSE, MQTT_SIMULATION_START_PREFIX } from '../constants/warehouse.js';
import { GPSService } from './gpsService.js';

let publisher: mqtt.MqttClient | null = null;

function getPublisher(): Promise<mqtt.MqttClient> {
  if (publisher?.connected) return Promise.resolve(publisher);

  return new Promise((resolve, reject) => {
    const brokerUrl = `${mqttConfig.protocol}://${mqttConfig.host}:${mqttConfig.port}`;
    const client = mqtt.connect(brokerUrl, {
      clientId: `equiptrack-sim-pub-${Date.now()}`,
      reconnectPeriod: 5000,
      connectTimeout: 15000,
      username: mqttConfig.username,
      password: mqttConfig.password,
    });

    const onReady = () => {
      client.off('error', onError);
      publisher = client;
      resolve(client);
    };

    const onError = (err: Error) => {
      client.end(true);
      reject(err);
    };

    if (client.connected) {
      onReady();
      return;
    }

    client.once('connect', onReady);
    client.once('error', onError);
  });
}

/** Publish departure position at Oued Smar before the GPX simulator runs. */
export async function seedWarehouseDeparture(deviceSerial: string) {
  await GPSService.saveGPSData({
    device_id: deviceSerial,
    lat: WAREHOUSE.latitude,
    lng: WAREHOUSE.longitude,
    heading: 0,
    battery: 100,
    timestamp: new Date(),
  });
}

/**
 * Start IoT GPS simulation for the mission's container device.
 * Requires `python gps_simulator.py --listen` in iot_system.
 */
export async function startMissionGpsSimulation(missionId: string, containerId: string) {
  const gps = await GPSDevice.findOne({ where: { container_id: containerId } });
  if (!gps) {
    console.warn(`[simulation] No GPS device for container ${containerId} (mission ${missionId})`);
    return;
  }

  const deviceSerial = gps.device_serial_number;
  
  try {
    // Ensure warehouse starting position is saved before publishing simulation start
    await seedWarehouseDeparture(deviceSerial);
    console.log(`📍 Warehouse departure position seeded for ${deviceSerial} at ${WAREHOUSE.latitude}, ${WAREHOUSE.longitude}`);
    
    // Small delay to ensure database write is complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const client = await getPublisher();
    const topic = `${MQTT_SIMULATION_START_PREFIX}/${deviceSerial}`;
    const payload = JSON.stringify({ missionId, action: 'start', warehouse: WAREHOUSE.name });
    await new Promise<void>((resolve, reject) => {
      client.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log(`📡 Simulation start published → ${topic} (mission ${missionId})`);
  } catch (err) {
    console.error(
      `[simulation] MQTT publish failed for ${deviceSerial}. Is gps_simulator.py --listen running?`,
      err,
    );
  }
}
