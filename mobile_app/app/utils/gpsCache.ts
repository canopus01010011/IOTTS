import type { GpsTrackPoint, LiveGpsDevice } from "@/app/services/gps.service";
import { readCache, writeCache } from "@/app/utils/storageCache";

type GpsCacheData = {
  device: LiveGpsDevice | null;
  trackPoints: GpsTrackPoint[];
};

const prefix = "cache_gps_v1_";

export async function getCachedGps(containerId: string): Promise<GpsCacheData | null> {
  const envelope = await readCache<GpsCacheData>(`${prefix}${containerId}`);
  return envelope?.data ?? null;
}

export async function setCachedGps(
  containerId: string,
  data: GpsCacheData,
): Promise<void> {
  await writeCache(`${prefix}${containerId}`, data);
}
