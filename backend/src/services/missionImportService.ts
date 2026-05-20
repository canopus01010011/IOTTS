import { User, Site, Container } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { mapLegacyEquipements } from './missionEquipmentService.js';
import { resolveAllMissionEntities } from './missionEntityResolver.js';
import type { MissionEquipmentItem } from './missionEquipmentService.js';
import type { ResolvedEntities } from './missionEntityResolver.js';

export interface MissionImportPayload {
  reference?: string;
  scheduled_start_date: Date;
  scheduled_end_date: Date;
  driver_id: string;
  technician_id: string;
  site_id: string;
  equipment_list: MissionEquipmentItem[] | unknown[];
  container_id?: string;
  status?: string;
}

function normalizeText(value: unknown): string {
  return String(value ?? '').trim();
}

function parseDateTime(value: unknown): Date | null {
  const raw = normalizeText(value);
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function extractMissionBody(data: Record<string, unknown>): Record<string, unknown> {
  if (data.mission && typeof data.mission === 'object') {
    return data.mission as Record<string, unknown>;
  }
  if (data.file_format && typeof data.file_format === 'object') {
    return data.file_format as Record<string, unknown>;
  }
  return data;
}

function hasEquipmentInput(body: Record<string, unknown>): boolean {
  if (Array.isArray(body.equipment_list) && body.equipment_list.length > 0) return true;
  if (Array.isArray(body.equipements) && body.equipements.length > 0) return true;
  return false;
}

function hasDriverInput(body: Record<string, unknown>): boolean {
  return Boolean(
    body.driver_id ||
    body.driver ||
    body.conducteur,
  );
}

function hasTechnicianInput(body: Record<string, unknown>): boolean {
  return Boolean(
    body.technician_id ||
    body.technician ||
    body.technicien,
  );
}

function hasSiteInput(body: Record<string, unknown>): boolean {
  return Boolean(
    body.site_id ||
    body.site ||
    body.Site ||
    body.site_name,
  );
}

function hasScheduleInput(body: Record<string, unknown>): boolean {
  return Boolean(
    body.scheduled_start_date ||
    body.date ||
    body.scheduled_end_date ||
    body.date_fin,
  );
}

/** Client-side compatible check (IDs or nested entities). */
export function isMissionImportFormat(data: Record<string, unknown>): boolean {
  const body = extractMissionBody(data);
  return Boolean(
    hasScheduleInput(body) &&
    hasDriverInput(body) &&
    hasTechnicianInput(body) &&
    hasSiteInput(body) &&
    hasEquipmentInput(body),
  );
}

/** @deprecated use isMissionImportFormat */
export function isBackendMissionFormat(data: Record<string, unknown>): boolean {
  return isMissionImportFormat(data);
}

function resolveEquipmentRaw(body: Record<string, unknown>): unknown[] {
  if (Array.isArray(body.equipment_list) && body.equipment_list.length > 0) {
    return body.equipment_list;
  }
  const legacy = mapLegacyEquipements(body);
  if (legacy?.length) return legacy;
  throw new AppError('equipment_list ou equipements est requis.');
}

export async function resolveMissionFromImport(
  data: Record<string, unknown>,
): Promise<
  Omit<MissionImportPayload, 'equipment_list'> & {
    equipment_list: unknown[];
    resolved_entities: ResolvedEntities;
  }
> {
  const body = extractMissionBody(data);

  if (!isMissionImportFormat(body)) {
    throw new AppError(
      'Format JSON invalide. Requis : dates planifiées, conducteur (driver_id ou driver{}), technicien, site (site_id ou site{}), equipment_list[] avec type/serial_number/model.',
    );
  }

  const scheduled_start_date =
    parseDateTime(body.scheduled_start_date) ||
    parseDateTime(body.date);
  let scheduled_end_date =
    parseDateTime(body.scheduled_end_date) ||
    parseDateTime(body.date_fin);

  if (scheduled_start_date && !scheduled_end_date) {
    const d = new Date(scheduled_start_date);
    d.setHours(d.getHours() + 2);
    scheduled_end_date = d;
  }

  if (!scheduled_start_date || !scheduled_end_date) {
    throw new AppError('scheduled_start_date et scheduled_end_date sont requis (date + heure).');
  }

  if (scheduled_end_date.getTime() <= scheduled_start_date.getTime()) {
    throw new AppError('scheduled_end_date doit être après scheduled_start_date.');
  }

  const resolved_entities = await resolveAllMissionEntities(body);
  const equipment_list = resolveEquipmentRaw(body);

  const reference =
    normalizeText(data.reference) ||
    normalizeText(body.reference) ||
    undefined;

  return {
    reference: reference || undefined,
    scheduled_start_date,
    scheduled_end_date,
    driver_id: resolved_entities.driver_id,
    technician_id: resolved_entities.technician_id,
    site_id: resolved_entities.site_id,
    equipment_list,
    container_id: resolved_entities.container_id,
    status: 'pending',
    resolved_entities,
  };
}

export async function buildImportTemplate() {
  const [drivers, technicians, sites, containers] = await Promise.all([
    User.findAll({
      where: { role: 'driver' },
      attributes: ['id', 'full_name', 'email', 'phone'],
      limit: 5,
    }),
    User.findAll({
      where: { role: 'technician' },
      attributes: ['id', 'full_name', 'email', 'phone'],
      limit: 5,
    }),
    Site.findAll({
      attributes: ['id', 'name', 'address', 'latitude', 'longitude'],
      limit: 5,
    }),
    Container.findAll({
      attributes: ['id', 'qr_code', 'capacity', 'status'],
      limit: 5,
    }),
  ]);

  const start = new Date();
  const end = new Date(start);
  end.setHours(end.getHours() + 2);

  const exampleDriver = drivers[0];
  const exampleTech = technicians[0];
  const exampleSite = sites[0];
  const exampleContainer = containers[0];

  const template: Record<string, unknown> = {
    reference: `MSN-${start.toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-4)}`,
    scheduled_start_date: start.toISOString(),
    scheduled_end_date: end.toISOString(),
    status: 'pending',
    driver_id: exampleDriver?.id || '',
    technician_id: exampleTech?.id || '',
    site: exampleSite
      ? {
          id: exampleSite.id,
          name: exampleSite.name,
          address: exampleSite.address,
          latitude: Number(exampleSite.latitude),
          longitude: Number(exampleSite.longitude),
        }
      : {
          name: 'Tour B12 — Centre ville',
          address: '12 Avenue Habib Bourguiba, Tunis',
          latitude: 36.8065,
          longitude: 10.1815,
        },
    driver: exampleDriver
      ? {
          id: exampleDriver.id,
          full_name: exampleDriver.full_name,
          email: exampleDriver.email,
          phone: exampleDriver.phone,
        }
      : {
          full_name: 'Ahmed Conducteur',
          email: 'ahmed.driver@example.com',
          phone: '+21620000001',
        },
    technician: exampleTech
      ? {
          id: exampleTech.id,
          full_name: exampleTech.full_name,
          email: exampleTech.email,
          phone: exampleTech.phone,
        }
      : {
          full_name: 'Sami Technicien',
          email: 'sami.tech@example.com',
          phone: '+21620000002',
        },
    equipment_list: [
      {
        type: 'Fibre optique',
        label: 'Fibre optique',
        serial_number: 'SN-FIB-2026-001',
        model: 'FO-48C',
        quantity: 1,
        equipment_status: 'in_use',
      },
      {
        type: 'Câblage réseau',
        label: 'Câblage réseau',
        serial_number: 'SN-CAB-2026-002',
        model: 'CAT6-500M',
        quantity: 2,
        equipment_status: 'in_use',
      },
    ],
    container: exampleContainer
      ? {
          id: exampleContainer.id,
          qr_code: exampleContainer.qr_code,
          capacity: exampleContainer.capacity,
          status: exampleContainer.status,
          gps_device: {
            device_serial_number: 'GPS-SN-EXAMPLE-001',
            battery_level: 95,
            device_status: 'active',
          },
        }
      : {
          qr_code: 'CTR-QR-NEW-001',
          capacity: 120,
          status: 'available',
          gps_device: {
            device_serial_number: 'GPS-SN-NEW-001',
            battery_level: 100,
            device_status: 'active',
          },
        },
  };

  return {
    template,
    resources: {
      drivers,
      technicians,
      sites,
      containers,
    },
    schema: {
      description: 'Import : conducteur et technicien doivent exister en base ; site/conteneur/équipement créés si absents',
      scheduled_dates: 'ISO 8601 datetime',
      site: '{ id? | name, address, latitude, longitude } — créé si absent',
      driver: '{ id | email | phone } — doit exister (pas de création auto)',
      technician: '{ id | email | phone } — doit exister (pas de création auto)',
      equipment_list:
        '[{ type|label, serial_number, model, quantity, equipment_status?, equipment_id? }]',
      container: '{ id? | qr_code, capacity, status?, gps_device?: { device_serial_number, battery_level?, device_status? } }',
      legacy_flat_ids: 'driver_id, technician_id, site_id, container_id still supported',
      optional: ['reference', 'status', 'equipements', 'mission', 'file_format'],
    },
  };
}
