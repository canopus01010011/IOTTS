import { useEffect, useState } from "react";
import {
  getGpsForContainer,
  type LiveGpsDevice,
} from "@/app/services/gps.service";

const POLL_MS = 10000;

export function useLiveGps(containerId?: string | null) {
  const [device, setDevice] = useState<LiveGpsDevice | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!containerId) {
      setDevice(null);
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const data = await getGpsForContainer(containerId);
        if (active) setDevice(data);
      } catch {
        if (active) setDevice(null);
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
  const hasPosition =
    latitude != null &&
    longitude != null &&
    !(latitude === 0 && longitude === 0);

  return {
    device,
    loading,
    latitude,
    longitude,
    hasPosition,
    battery: device?.battery_level,
    serial: device?.device_serial_number,
  };
}
