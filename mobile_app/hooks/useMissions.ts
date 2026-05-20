import { useEffect, useMemo, useState } from "react";
import { getAllMissions } from "@/app/services/missions.service";
import {
  mapMissionForCard,
  type MissionCardData,
} from "@/app/utils/missionMapper";

export function useMissions() {
  const [missions, setMissions] = useState<MissionCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadMissions() {
      try {
        const data = await getAllMissions();
        if (active) setMissions(data.map(mapMissionForCard));
      } catch (error) {
        console.error("Unable to load missions", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMissions();

    return () => {
      active = false;
    };
  }, []);

  const activeMissions = useMemo(
    () => missions.filter((m) => m.statusRaw !== "completed"),
    [missions],
  );

  const completedMissions = useMemo(
    () => missions.filter((m) => m.statusRaw === "completed"),
    [missions],
  );

  const activeMission = activeMissions.length > 0 ? activeMissions[0] : null;

  return {
    missions,
    activeMissions,
    activeMission,
    completedMissions,
    loading,
  };
}
