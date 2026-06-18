import { Mission, Site } from '../models/index.js';
import { WAREHOUSE, IOT_ROUTE_BY_DEVICE } from '../constants/warehouse.js';
import { GPSService } from './gpsService.js';
import { emitGPSUpdate } from '../sockets/socketHandler.js';

const INTERVAL_MS = parseInt(process.env.GPS_SIM_INTERVAL_MS || '5000', 10);
const IOT_ROUTES_URL = (process.env.IOT_ROUTES_URL || 'http://127.0.0.1:8001').replace(/\/$/, '');

type LatLng = { lat: number; lng: number };

type ActiveSim = {
  timer: ReturnType<typeof setInterval>;
  index: number;
  points: LatLng[];
  deviceSerial: string;
  missionId: string;
};

const active = new Map<string, ActiveSim>();

function interpolateLine(from: LatLng, to: LatLng, steps: number): LatLng[] {
  const points: LatLng[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    points.push({
      lat: from.lat + (to.lat - from.lat) * t,
      lng: from.lng + (to.lng - from.lng) * t,
    });
  }
  return points;
}

async function loadWaypoints(deviceSerial: string, missionId: string): Promise<LatLng[]> {
  const routeName = IOT_ROUTE_BY_DEVICE[deviceSerial];
  if (routeName) {
    try {
      const url = `${IOT_ROUTES_URL}/routes/${encodeURIComponent(routeName)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const json = (await res.json()) as {
          waypoints?: Array<{ latitude: number; longitude: number }>;
        };
        const wps = json.waypoints ?? [];
        if (wps.length > 0) {
          return wps.map((w) => ({ lat: w.latitude, lng: w.longitude }));
        }
      }
    } catch (err) {
      console.warn(`[simulation] Could not load route ${routeName} from ${IOT_ROUTES_URL}:`, err);
    }
  }

  const mission = await Mission.findByPk(missionId, { include: [{ model: Site }] });
  const site = mission?.Site;
  const warehouse: LatLng = { lat: WAREHOUSE.latitude, lng: WAREHOUSE.longitude };
  if (site?.latitude != null && site?.longitude != null) {
    return interpolateLine(warehouse, { lat: Number(site.latitude), lng: Number(site.longitude) }, 60);
  }
  return [warehouse];
}

async function publishPoint(
  deviceSerial: string,
  point: LatLng,
  index: number,
): Promise<void> {
  const battery = Math.max(0, 100 - Math.floor(index / 3));
  const result = await GPSService.saveGPSData({
    device_id: deviceSerial,
    lat: point.lat,
    lng: point.lng,
    heading: 0,
    battery,
    timestamp: new Date(),
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
}

/** In-process GPS simulation (no MQTT / Python required). */
export async function startBackendRouteSimulation(
  missionId: string,
  deviceSerial: string,
): Promise<void> {
  stopBackendRouteSimulation(deviceSerial);

  const points = await loadWaypoints(deviceSerial, missionId);
  if (!points.length) return;

  const state: ActiveSim = {
    timer: null as unknown as ReturnType<typeof setInterval>,
    index: 0,
    points,
    deviceSerial,
    missionId,
  };

  const tick = async () => {
    if (state.index >= state.points.length) {
      stopBackendRouteSimulation(deviceSerial);
      console.log(`[simulation] Route complete for ${deviceSerial} (mission ${missionId})`);
      return;
    }
    const point = state.points[state.index];
    await publishPoint(deviceSerial, point, state.index);
    state.index += 1;
  };

  await tick();
  state.timer = setInterval(() => {
    void tick();
  }, INTERVAL_MS);

  active.set(deviceSerial, state);
  console.log(
    `[simulation] Backend route started: ${deviceSerial}, ${points.length} points, every ${INTERVAL_MS}ms`,
  );
}

export function stopBackendRouteSimulation(deviceSerial: string): void {
  const sim = active.get(deviceSerial);
  if (!sim) return;
  clearInterval(sim.timer);
  active.delete(deviceSerial);
  console.log(`[simulation] Backend route stopped: ${deviceSerial}`);
}
