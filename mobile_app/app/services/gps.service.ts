import api from "./api";

export type LiveGpsDevice = {
  id: string;
  container_id: string;
  device_serial_number: string;
  battery_level: number;
  device_status: string;
  latitude?: number | null;
  longitude?: number | null;
  timestamp?: string | null;
  TrackingData?: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
  }>;
};

export type GpsTrackPoint = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

export async function getLiveGpsDevices(): Promise<LiveGpsDevice[]> {
  const response = await api.get<{
    success: boolean;
    data: LiveGpsDevice[];
  }>("/gps/live");

  return response.data ?? [];
}

export async function getGpsForContainer(containerId?: string | null) {
  if (!containerId) return null;

  const devices = await getLiveGpsDevices();
  return devices.find((d) => d.container_id === containerId) ?? null;
}

export async function getLiveGpsForContainer(containerId?: string | null) {
  if (!containerId) return null;

  const response = await api.get<{ success: boolean; data: LiveGpsDevice }>(
    `/gps/container/${containerId}/live`,
  );
  return response.data ?? null;
}

export async function getGpsHistoryForContainer(
  containerId?: string | null,
  limit = 300,
) {
  if (!containerId) return [];

  const response = await api.get<{
    success: boolean;
    count: number;
    data: GpsTrackPoint[];
  }>(`/gps/container/${containerId}/history?limit=${limit}`);

  return response.data ?? [];
}
