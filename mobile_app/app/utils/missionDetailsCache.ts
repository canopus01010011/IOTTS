import { readCache, writeCache } from "@/app/utils/storageCache";

const prefix = "cache_mission_detail_v1_";

export async function getCachedMissionDetail(
  missionId: string,
): Promise<Record<string, unknown> | null> {
  const envelope = await readCache<Record<string, unknown>>(`${prefix}${missionId}`);
  return envelope?.data ?? null;
}

export async function setCachedMissionDetail(
  missionId: string,
  data: Record<string, unknown>,
): Promise<void> {
  await writeCache(`${prefix}${missionId}`, data);
}
