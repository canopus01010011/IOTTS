import api from "./api";

export async function getMissionById(id: string): Promise<any> {
  try {
    const response = await api.get<any>(`/missions/${id}`);
    return response;
  } catch (error: any) {
    console.error(
      "getMissionById error:",
      error?.response?.data || error.message,
    );
    throw new Error("Failed to fetch mission");
  }
}

export async function getAllMissions(): Promise<any[]> {
  try {
    const response = await api.get<{ missions: any[] }>(
      "/missions?limit=50",
    );

    return response.missions ?? [];
  } catch (error: any) {
    console.error(
      "getAllMissions error:",
      error?.response?.data || error.message,
    );
    throw new Error("Failed to fetch missions");
  }
}
