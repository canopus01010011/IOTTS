import api from "./api";

export type ApiMission = Record<string, unknown>;

export async function getMissionById(id: string): Promise<ApiMission> {
  return api.get<ApiMission>(`/missions/${id}`);
}

export async function getAllMissions(): Promise<ApiMission[]> {
  const response = await api.get<{ missions: ApiMission[] }>(
    "/missions?limit=50",
  );

  return response.missions ?? [];
}
