import api from "./api";

export type DeliveryStatus = {
  missionId: string;
  status: string;
  confirmation: {
    driver: { confirmed: boolean; timestamp?: string };
    technician: { confirmed: boolean; timestamp?: string };
    status: string;
  };
  completedAt?: string;
  report?: {
    id: string;
    mission_id: string;
    description: string;
    notes?: string;
    delivery_photo_url: string[];
    report_date?: string;
    created_at?: string;
    sent_at?: string;
  } | null;
};

export async function scanDelivery(missionId: string) {
  return api.post<{
    success: boolean;
    message: string;
    status?: string;
    nextStep?: string;
    completedAt?: string;
  }>("/deliveries/scan", { missionId });
}

export async function getDeliveryStatus(missionId: string) {
  const response = await api.get<{ success: boolean; data: DeliveryStatus }>(
    `/deliveries/status/${missionId}`,
  );
  return response.data;
}
