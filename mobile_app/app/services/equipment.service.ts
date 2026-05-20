import api from "./api";

export type EquipmentItem = {
  id: string;
  type: string;
  serial_number: string;
  model: string;
  equipment_status: string;
};

export async function getEquipmentById(
  equipmentId: string,
): Promise<EquipmentItem> {
  return api.get<EquipmentItem>(`/equipment/${equipmentId}`);
}
