import { useEffect, useState } from "react";
import { getAllMissions } from "@/app/services/missions.service";

export function useMissions() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadMissions() {
      try {
        const data = await getAllMissions();
        if (active) setMissions(data);
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

  const activeMissions = missions.filter(
    (m) => (m.status || "").toString().toLowerCase() !== "completed",
  );

  const completedMissions = missions.filter(
    (m) => (m.status || "").toString().toLowerCase() === "completed",
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
