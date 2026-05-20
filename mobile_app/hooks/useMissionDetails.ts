import { useEffect, useState } from "react";
import { getEquipmentById } from "@/app/services/equipment.service";
import { getGpsForContainer } from "@/app/services/gps.service";
import { getMissionById } from "@/app/services/missions.service";
import type { LiveGpsDevice } from "@/app/services/gps.service";
import type { EquipmentItem } from "@/app/services/equipment.service";

type MissionEquipmentRow = EquipmentItem & { quantity: number };

export function useMissionDetails(missionId?: string) {
  const [mission, setMission] = useState<Record<string, any> | null>(null);
  const [equipment, setEquipment] = useState<MissionEquipmentRow[]>([]);
  const [gps, setGps] = useState<LiveGpsDevice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const gpsDevice = await getGpsForContainer(missionData.container_id);

        if (!active) return;
        setEquipment(equipmentRows);
        setGps(gpsDevice);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Failed to load mission details",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [missionId]);

  return { mission, equipment, gps, loading, error };
}
