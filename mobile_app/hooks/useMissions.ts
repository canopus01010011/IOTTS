import { getAllMissions } from "@/app/services/missions.service";
import {
  getCachedMissions,
  setCachedMissions,
} from "@/app/utils/missionsCache";
import {
  mapMissionForCard,
  type MissionCardData,
} from "@/app/utils/missionMapper";
import { isNetworkError } from "@/app/utils/networkError";
import { useOffline } from "@/context/OfflineContext";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useMissions() {
  const [missions, setMissions] = useState<MissionCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const { isOnline, registerOnReconnect } = useOffline();

  const loadMissions = useCallback(async () => {
    try {
      const data = await getAllMissions();
      const mapped = data.map(mapMissionForCard);
      setMissions(mapped);
      setIsFromCache(false);
      setCachedAt(null);
      await setCachedMissions(mapped);
    } catch (error) {
      console.error("Unable to load missions", error);
      const cached = await getCachedMissions();
      if (cached.missions.length > 0) {
        setMissions(cached.missions);
        setIsFromCache(true);
        setCachedAt(cached.savedAt);
      }
      if (!isNetworkError(error) && cached.missions.length === 0) {
        throw error;
      }
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      setLoading(true);
      await loadMissions();
      if (active) setLoading(false);
    }

    init();

    return () => {
      active = false;
    };
  }, [loadMissions]);

  useEffect(() => {
    return registerOnReconnect(() => {
      void loadMissions();
    });
  }, [registerOnReconnect, loadMissions]);

  const activeMissions = useMemo(
    () => missions.filter((m) => m.statusRaw !== "completed"),
    [missions],
  );

  const completedMissions = useMemo(
    () => missions.filter((m) => m.statusRaw === "completed"),
    [missions],
  );

  const activeMission = useMemo(() => {
    const inProgress = activeMissions.find((m) => m.statusRaw === "in-progress");
    if (inProgress) return inProgress;
    const pending = activeMissions.find((m) => m.statusRaw === "pending");
    return pending ?? (activeMissions.length > 0 ? activeMissions[0] : null);
  }, [activeMissions]);

  return {
    missions,
    activeMissions,
    activeMission,
    completedMissions,
    loading,
    isFromCache,
    cachedAt,
    isOnline,
    refetch: loadMissions,
  };
}
