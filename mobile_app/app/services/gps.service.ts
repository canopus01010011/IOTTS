import api from "./api";

export type LiveGpsDevice = {
  id: string;
  container_id: string;
  device_serial_number: string;
  battery_level: number;
  device_status: string;
  TrackingData?: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
  }>;
};

export async function getLiveGpsDevices(): Promise<LiveGpsDevice[]> {
  const response = await api.get<{
    success: boolean;
    data: LiveGpsDevice[];
  }>("/gps/live");

  return response.data?.data ?? [];
}

export async function getGpsForContainer(containerId?: string | null) {
  if (!containerId) return null;

  const devices = await getLiveGpsDevices();
  return devices.find((d) => d.container_id === containerId) ?? null;
}
