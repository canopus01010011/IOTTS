import { getEquipmentById } from "@/app/services/equipment.service";
import { getGpsForContainer } from "@/app/services/gps.service";
import { getMissionById } from "@/app/services/missions.service";
import type { LiveGpsDevice } from "@/app/services/gps.service";
import type { EquipmentItem } from "@/app/services/equipment.service";
import {
  getCachedMissionDetail,
  setCachedMissionDetail,
} from "@/app/utils/missionDetailsCache";
import { isNetworkError } from "@/app/utils/networkError";
import { useOffline } from "@/context/OfflineContext";
import { useEffect, useState } from "react";

type MissionEquipmentRow = EquipmentItem & { quantity: number };

export function useMissionDetails(missionId?: string) {
  const [mission, setMission] = useState<Record<string, any> | null>(null);
  const [equipment, setEquipment] = useState<MissionEquipmentRow[]>([]);
  const [gps, setGps] = useState<LiveGpsDevice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const { isOnline, registerOnReconnect } = useOffline();

  useEffect(() => {
    if (!missionId) {
      setLoading(false);
      setError("Mission ID is missing");
      return;
    }

    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const missionData = await getMissionById(String(missionId));
        if (!active) return;

        setMission(missionData);
        setIsFromCache(false);
        await setCachedMissionDetail(String(missionId), missionData);

        const list = Array.isArray(missionData.equipment_list)
          ? missionData.equipment_list
          : [];

        const equipmentRows = await Promise.all(
          list.map(async (item: { equipment_id: string; quantity: number }) => {
            try {
              const details = await getEquipmentById(item.equipment_id);
              return { ...details, quantity: item.quantity ?? 1 };
            } catch {
              return {
                id: item.equipment_id,
                type: "Equipment",
                serial_number: "—",
                model: "—",
                equipment_status: "unknown",
                quantity: item.quantity ?? 1,
              };
            }
          }),
        );

        let gpsDevice: LiveGpsDevice | null = null;
        if (missionData.container_id && isOnline) {
          try {
            gpsDevice = await getGpsForContainer(missionData.container_id);
          } catch {
            gpsDevice = null;
          }
        }

        if (!active) return;
        setEquipment(equipmentRows);
        setGps(gpsDevice);
      } catch (err) {
        if (!active) return;
        const cached = await getCachedMissionDetail(String(missionId));
        if (cached) {
          setMission(cached);
          setIsFromCache(true);
          setError(null);
          const list = Array.isArray(cached.equipment_list)
            ? (cached.equipment_list as { equipment_id: string; quantity: number }[])
            : [];
          setEquipment(
            list.map((item) => ({
              id: item.equipment_id,
              type: "Equipment",
              serial_number: "—",
              model: "—",
              equipment_status: "unknown",
              quantity: item.quantity ?? 1,
            })),
          );
        } else {
          setError(
            isNetworkError(err)
              ? "Offline — no cached mission data. Open this mission once while online."
              : err instanceof Error
                ? err.message
                : "Failed to load mission details",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [missionId, isOnline]);

  useEffect(() => {
    if (!missionId) return;
    return registerOnReconnect(() => {
      void (async () => {
        try {
          const missionData = await getMissionById(String(missionId));
          setMission(missionData);
          setIsFromCache(false);
          await setCachedMissionDetail(String(missionId), missionData);
        } catch {
          // keep cache
        }
      })();
    });
  }, [missionId, registerOnReconnect]);

  return { mission, equipment, gps, loading, error, isFromCache };
}
