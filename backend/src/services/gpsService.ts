import { GPSDevice, TrackingData } from '../models/index.js';

export interface GPSData {
  device_id: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  battery?: number;
  timestamp?: Date;
}

export interface GPSSaveResult {
  success: boolean;
  gpsId: string;
  containerId: string | null;
  deviceSerial: string;
  lat: number;
  lng: number;
  heading?: number;
  battery?: number;
}

export class GPSService {
  static async saveGPSData(data: GPSData): Promise<GPSSaveResult | null> {
    try {
      const gpsDevice = await GPSDevice.findOne({
        where: { device_serial_number: data.device_id },
      });

      if (!gpsDevice) {
        console.error(`GPS device not found for serial number: ${data.device_id}`);
        return null;
      }

      const timestamp = data.timestamp || new Date();

      await TrackingData.create({
        gps_id: gpsDevice.id,
        latitude: data.lat,
        longitude: data.lng,
        timestamp,
      });

      const deviceUpdates: Record<string, unknown> = {};
      if (data.battery !== undefined && Number.isFinite(data.battery)) {
        deviceUpdates.battery_level = Math.min(100, Math.max(0, Math.round(data.battery)));
      }
      if (Object.keys(deviceUpdates).length) {
        await gpsDevice.update(deviceUpdates);
      }

      return {
        success: true,
        gpsId: gpsDevice.id,
        containerId: gpsDevice.container_id ?? null,
        deviceSerial: gpsDevice.device_serial_number,
        lat: data.lat,
        lng: data.lng,
        heading: data.heading,
        battery: data.battery ?? gpsDevice.battery_level,
      };
    } catch (error) {
      console.error('Error saving GPS data:', error);
      return null;
    }
  }

  static async getEquipmentHistory(gpsId: string, limit: number = 100) {
    return TrackingData.findAll({
      where: { gps_id: gpsId },
      order: [['timestamp', 'DESC']],
      limit,
    });
  }

  static async getHistoryByContainerId(containerId: string, limit: number = 200) {
    const gpsDevice = await GPSDevice.findOne({ where: { container_id: containerId } });
    if (!gpsDevice) return [];

    return TrackingData.findAll({
      where: { gps_id: gpsDevice.id },
      order: [['timestamp', 'ASC']],
      limit,
      attributes: ['latitude', 'longitude', 'timestamp'],
    });
  }

  static async getLiveByContainerId(containerId: string) {
    const gpsDevice = await GPSDevice.findOne({
      where: { container_id: containerId },
      attributes: ['id', 'container_id', 'device_serial_number', 'battery_level', 'device_status'],
      include: [
        {
          model: TrackingData,
          separate: true,
          limit: 1,
          order: [['timestamp', 'DESC']],
        },
      ],
    });

    if (!gpsDevice) return null;

    const latest = gpsDevice.TrackingData?.[0];
    return {
      id: gpsDevice.id,
      container_id: gpsDevice.container_id,
      device_serial_number: gpsDevice.device_serial_number,
      battery_level: gpsDevice.battery_level,
      device_status: gpsDevice.device_status,
      latitude: latest ? Number(latest.latitude) : null,
      longitude: latest ? Number(latest.longitude) : null,
      timestamp: latest?.timestamp ?? null,
    };
  }

  static async getAllLiveLocations() {
    return GPSDevice.findAll({
      attributes: ['id', 'container_id', 'device_serial_number', 'battery_level', 'device_status'],
      include: [
        {
          model: TrackingData,
          separate: true,
          limit: 1,
          order: [['timestamp', 'DESC']],
        },
      ],
    });
  }
}
