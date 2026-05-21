import type { MissionCardData } from "@/app/utils/missionMapper";
import { readCache, writeCache } from "@/app/utils/storageCache";

const MISSIONS_KEY = "cache_missions_v1";

export async function getCachedMissions(): Promise<{
  missions: MissionCardData[];
  savedAt: string | null;
}> {
  const envelope = await readCache<MissionCardData[]>(MISSIONS_KEY);
  return {
    missions: envelope?.data ?? [],
    savedAt: envelope?.savedAt ?? null,
  };
}

export async function setCachedMissions(missions: MissionCardData[]): Promise<void> {
  await writeCache(MISSIONS_KEY, missions);
}

/** Optimistic local update after an offline warehouse / site scan. */
export async function patchCachedMissionStatus(
  missionId: string,
  statusRaw: "in-progress" | "completed",
): Promise<void> {
  const { missions } = await getCachedMissions();
  if (!missions.length) return;

  const updated = missions.map((m) => {
    if (m.id !== missionId) return m;
    const raw = { ...(m.raw as Record<string, unknown>), status: statusRaw };
    return {
      ...m,
      statusRaw,
      status:
        statusRaw === "completed"
          ? "Completed"
          : statusRaw === "in-progress"
            ? "In Progress"
            : m.status,
      raw,
    };
  });

  await setCachedMissions(updated);
}
