import { useEffect, useState } from "react";
import {
  getGpsHistoryForContainer,
  getLiveGpsForContainer,
  type GpsTrackPoint,
  type LiveGpsDevice,
} from "@/app/services/gps.service";

const POLL_MS = 10000;

export function useLiveGps(containerId?: string | null) {
  const [device, setDevice] = useState<LiveGpsDevice | null>(null);
  const [trackPoints, setTrackPoints] = useState<GpsTrackPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!containerId) {
      setDevice(null);
      setTrackPoints([]);
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const [live, history] = await Promise.all([
          getLiveGpsForContainer(containerId),
          getGpsHistoryForContainer(containerId),
        ]);
        if (active) {
          setDevice(live);
          setTrackPoints(history);
        }
      } catch {
        if (active) {
          setDevice(null);
          setTrackPoints([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    setLoading(true);
    load();
    const timer = setInterval(load, POLL_MS);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [containerId]);

  const latest = device?.TrackingData?.[0];
  const latitude = latest ? Number(latest.latitude) : null;
  const longitude = latest ? Number(latest.longitude) : null;
  const liveLatitude = device?.latitude != null ? Number(device.latitude) : latitude;
  const liveLongitude = device?.longitude != null ? Number(device.longitude) : longitude;
  const hasPosition =
    liveLatitude != null &&
    liveLongitude != null &&
    !(liveLatitude === 0 && liveLongitude === 0);

  return {
    device,
    trackPoints,
    loading,
    latitude: liveLatitude,
    longitude: liveLongitude,
    hasPosition,
    battery: device?.battery_level,
    serial: device?.device_serial_number,
  };
}
