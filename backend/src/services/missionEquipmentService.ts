import { Equipment } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';

export interface MissionEquipmentItem {
  equipment_id: string;
  label?: string;
  quantity: number;
  serial_number?: string;
  model?: string;
}

function normalizeText(value: unknown): string {
  return String(value ?? '').trim();
}

const VALID_STATUS = ['available', 'in_use', 'maintenance', 'lost'] as const;

/**
 * Normalize mission equipment input.
 * Finds by equipment_id or serial_number; creates new rows with full DB fields when missing.
 */
export async function persistMissionEquipment(
  raw: unknown,
  missionId: string,
  containerId?: string,
): Promise<MissionEquipmentItem[]> {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new AppError('equipment_list est requis (au moins un équipement).');
  }

  const result: MissionEquipmentItem[] = [];

  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    let label = '';
    let quantity = 1;
    let existingId = '';
    let serial_number = '';
    let model = '';
    let equipment_status: (typeof VALID_STATUS)[number] = 'in_use';
    let itemContainerId = containerId;

    if (typeof item === 'string') {
      label = normalizeText(item);
      quantity = 1;
    } else if (item && typeof item === 'object') {
      const row = item as Record<string, unknown>;
      label = normalizeText(
        row.label || row.name || row.type || row.equipment_type || row.equipment_name,
      );
      existingId = normalizeText(row.equipment_id || row.id);
      serial_number = normalizeText(row.serial_number || row.serial);
      model = normalizeText(row.model || row.equipment_model);
      quantity = Number(row.quantity) || 1;
      const statusRaw = normalizeText(row.equipment_status || row.status);
      if (VALID_STATUS.includes(statusRaw as (typeof VALID_STATUS)[number])) {
        equipment_status = statusRaw as (typeof VALID_STATUS)[number];
      }
      const rowContainer = normalizeText(row.container_id);
      if (rowContainer) itemContainerId = rowContainer;
    } else {
      throw new AppError(`equipment_list[${i}] invalide.`);
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new AppError(`equipment_list[${i}].quantity doit être >= 1.`);
    }

    if (!label && !existingId && !serial_number) {
      throw new AppError(
        `equipment_list[${i}] : type/label, equipment_id ou serial_number requis.`,
      );
    }

    let found: Equipment | null = null;
    if (existingId) {
      found = await Equipment.findByPk(existingId);
    }
    if (!found && serial_number) {
      found = await Equipment.findOne({ where: { serial_number } });
    }

    if (found) {
      const updates: Record<string, unknown> = {};
      if (label && found.type !== label) updates.type = label;
      if (model && found.model !== model) updates.model = model;
      if (equipment_status && found.equipment_status !== equipment_status) {
        updates.equipment_status = equipment_status;
      }
      if (itemContainerId && found.container_id !== itemContainerId) {
        updates.container_id = itemContainerId;
      }
      if (Object.keys(updates).length) await found.update(updates);

      result.push({
        equipment_id: found.id,
        label: label || found.type,
        quantity: Math.floor(quantity),
        serial_number: found.serial_number,
        model: found.model,
      });
      continue;
    }

    const typeLabel = label || serial_number || `Equipment-${i + 1}`;
    const serial =
      serial_number ||
      `MIS-${missionId}-${i + 1}-${Date.now().toString(36).slice(-6)}`;
    const equipmentModel = model || `mission:${missionId}`;

    const created = await Equipment.create({
      type: typeLabel,
      model: equipmentModel,
      serial_number: serial,
      equipment_status,
      container_id: itemContainerId,
    });

    result.push({
      equipment_id: created.id,
      label: typeLabel,
      quantity: Math.floor(quantity),
      serial_number: created.serial_number,
      model: created.model,
    });
  }

  return result;
}

/** Legacy JSON: equipements: ["Fibre optique", ...] */
export function mapLegacyEquipements(raw: Record<string, unknown>): unknown[] | null {
  if (!Array.isArray(raw.equipements)) return null;
  return raw.equipements.map((name) => ({
    label: normalizeText(name),
    quantity: 1,
  }));
}
