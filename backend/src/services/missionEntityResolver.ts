import { Op } from 'sequelize';
import { User, Site, Container, GPSDevice } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';

const CODED_ID = /^[A-Z]{3,4}-[A-Z2-9]{6}$/;

export interface ResolvedEntities {
  site_id: string;
  driver_id: string;
  technician_id: string;
  container_id?: string;
  gps_device_id?: string;
  created: {
    site?: boolean;
    driver?: boolean;
    technician?: boolean;
    container?: boolean;
    gps_device?: boolean;
  };
}

function normalizeText(value: unknown): string {
  return String(value ?? '').trim();
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function pickNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function isCodedId(value: string): boolean {
  return CODED_ID.test(value);
}

function isPlaceholderValue(value: string): boolean {
  if (!value) return true;
  return /REPLACE|PASTE_|YOUR_|XXX{2,}|CHANGER|TODO/i.test(value);
}

async function findUserById(id: string, role: 'driver' | 'technician') {
  if (!id || isPlaceholderValue(id)) return null;
  return User.findOne({ where: { id, role } });
}

async function findUserByEmail(email: string, role: 'driver' | 'technician') {
  const normalized = email.trim().toLowerCase();
  if (!normalized || isPlaceholderValue(normalized)) return null;
  return User.findOne({
    where: {
      role,
      email: { [Op.iLike]: normalized },
    },
  });
}

async function findUserByPhone(phone: string, role: 'driver' | 'technician') {
  if (!phone) return null;
  return User.findOne({ where: { phone, role } });
}

function buildFullName(row: Record<string, unknown>): string {
  const full = normalizeText(row.full_name || row.nom_complet || row.name);
  if (full) return full;
  const first = normalizeText(row.first_name || row.prenom);
  const second = normalizeText(row.second_name || row.nom);
  return [first, second].filter(Boolean).join(' ').trim();
}

/**
 * Resolve an existing driver/technician (must already exist — login requires password).
 */
export async function resolveUser(
  body: Record<string, unknown>,
  role: 'driver' | 'technician',
): Promise<{ id: string; created: boolean }> {
  const nestedKey = role === 'driver' ? 'driver' : 'technician';
  const flatIdKey = role === 'driver' ? 'driver_id' : 'technician_id';
  const legacyKey = role === 'driver' ? 'conducteur' : 'technicien';
  const roleLabel = role === 'driver' ? 'Conducteur' : 'Technicien';

  const nested =
    asObject(body[nestedKey]) ||
    asObject(body[legacyKey]) ||
    null;

  const flatId = normalizeText(
    body[flatIdKey] ||
      (role === 'driver' ? body.conducteur : body.technicien),
  );
  const row = nested || {};
  const id = normalizeText(row.id || row.user_id || flatId);
  const email = normalizeText(row.email).toLowerCase();
  const phone = normalizeText(row.phone || row.phone_num || row.telephone);
  const full_name = buildFullName(row);

  const user =
    (await findUserById(id, role)) ||
    (email ? await findUserByEmail(email, role) : null) ||
    (phone && !isPlaceholderValue(phone) ? await findUserByPhone(phone, role) : null);

  if (!user) {
    const hints: string[] = [];
    if (id && !isPlaceholderValue(id)) hints.push(`id=${id}`);
    if (email && !isPlaceholderValue(email)) hints.push(`email=${email}`);
    if (phone && !isPlaceholderValue(phone)) hints.push(`phone=${phone}`);
    const searched = hints.length ? hints.join(', ') : 'aucun identifiant valide (évitez les placeholders REPLACE)';
    throw new AppError(
      `${roleLabel} introuvable (${searched}). Utilisez ${flatIdKey} (ex. USR-…) ou ${nestedKey}.email réel depuis l'admin Conducteurs/Techniciens.`,
      400,
    );
  }

  const updates: Record<string, unknown> = {};
  if (full_name && user.full_name !== full_name) updates.full_name = full_name;
  if (phone && user.phone !== phone) updates.phone = phone;
  if (email && user.email !== email) updates.email = email;
  if (Object.keys(updates).length) await user.update(updates);

  return { id: user.id, created: false };
}

/**
 * Resolve or create a site from nested `site` object or flat site_* fields.
 */
export async function resolveSite(body: Record<string, unknown>): Promise<{ id: string; created: boolean }> {
  const nested = asObject(body.site) || asObject(body.Site);
  const row = nested || {};
  const flatId = normalizeText(body.site_id);

  const id = normalizeText(row.id || row.site_id || flatId);
  const name = normalizeText(row.name || row.site_name || body.site_name);
  const address = normalizeText(row.address || row.site_address || body.site_address);
  const latitude =
    pickNumber(row.latitude ?? row.site_latitude ?? body.site_latitude) ?? 0;
  const longitude =
    pickNumber(row.longitude ?? row.site_longitude ?? body.site_longitude) ?? 0;

  if (id && isCodedId(id)) {
    const existing = await Site.findByPk(id);
    if (existing) {
      const updates: Record<string, unknown> = {};
      if (name) updates.name = name;
      if (address) updates.address = address;
      if (row.latitude !== undefined || body.site_latitude !== undefined) updates.latitude = latitude;
      if (row.longitude !== undefined || body.site_longitude !== undefined) updates.longitude = longitude;
      if (Object.keys(updates).length) await existing.update(updates);
      return { id: existing.id, created: false };
    }
  }

  if (name) {
    const byName = await Site.findOne({
      where: { name: { [Op.iLike]: name } },
    });
    if (byName) {
      const updates: Record<string, unknown> = {};
      if (address) updates.address = address;
      if (latitude) updates.latitude = latitude;
      if (longitude) updates.longitude = longitude;
      if (Object.keys(updates).length) await byName.update(updates);
      return { id: byName.id, created: false };
    }
  }

  if (!name || !address) {
    throw new AppError(
      'Site requis : fournissez site_id existant, ou site { name, address, latitude, longitude }.',
    );
  }

  const created = await Site.create({
    name,
    address,
    latitude,
    longitude,
  });
  return { id: created.id, created: true };
}

/**
 * Resolve or create container; optional nested gps_device.
 */
export async function resolveContainer(
  body: Record<string, unknown>,
): Promise<{ container_id?: string; gps_device_id?: string; created: { container?: boolean; gps?: boolean } }> {
  const conteneurRaw = body.conteneur;
  const nested =
    asObject(body.container) ||
    (typeof conteneurRaw === 'object' ? asObject(conteneurRaw) : null);
  const flatId = normalizeText(
    body.container_id ||
      (typeof conteneurRaw === 'string' ? conteneurRaw : ''),
  );

  if (!nested && !flatId) {
    return { created: {} };
  }

  const row = nested || {};
  const id = normalizeText(row.id || row.container_id || flatId);
  const qr_code = normalizeText(row.qr_code || row.container_qr_code || row.code_qr);
  const capacity = pickNumber(row.capacity) ?? 100;
  const status = normalizeText(row.status) as
    | 'available'
    | 'assigned'
    | 'in_transit'
    | 'delivered'
    | 'maintenance'
    | '';

  let container = null;
  if (id && isCodedId(id)) {
    container = await Container.findByPk(id);
  }
  if (!container && qr_code) {
    container = await Container.findOne({ where: { qr_code } });
  }

  let containerCreated = false;
  if (!container) {
    if (!qr_code) {
      throw new AppError(
        'Conteneur requis : container_id existant ou container { qr_code, capacity }.',
      );
    }
    container = await Container.create({
      qr_code,
      capacity,
      status: status || 'available',
    });
    containerCreated = true;
  } else {
    const updates: Record<string, unknown> = {};
    if (qr_code && container.qr_code !== qr_code) updates.qr_code = qr_code;
    if (row.capacity !== undefined) updates.capacity = capacity;
    if (status) updates.status = status;
    if (Object.keys(updates).length) await container.update(updates);
  }

  const gpsInput =
    asObject(row.gps_device) ||
    asObject(row.gps) ||
    asObject(body.gps_device) ||
    asObject(body.gps);

  let gps_device_id: string | undefined;
  let gpsCreated = false;
  if (gpsInput) {
    const gps = await resolveGpsForContainer(container.id, gpsInput);
    gps_device_id = gps.id;
    gpsCreated = gps.created;
  }

  return {
    container_id: container.id,
    gps_device_id,
    created: { container: containerCreated, gps: gpsCreated },
  };
}

async function resolveGpsForContainer(
  containerId: string,
  row: Record<string, unknown>,
): Promise<{ id: string; created: boolean }> {
  const id = normalizeText(row.id || row.gps_id);
  const serial = normalizeText(
    row.device_serial_number || row.serial_number || row.serial,
  );
  const battery = pickNumber(row.battery_level) ?? 100;
  const device_status = (normalizeText(row.device_status) || 'active') as
    | 'active'
    | 'inactive'
    | 'maintenance'
    | 'lost';

  let device = null;
  if (id && isCodedId(id)) {
    device = await GPSDevice.findByPk(id);
  }
  if (!device && serial) {
    device = await GPSDevice.findOne({ where: { device_serial_number: serial } });
  }
  if (!device && containerId) {
    device = await GPSDevice.findOne({ where: { container_id: containerId } });
  }

  if (device) {
    await device.update({
      container_id: containerId,
      device_serial_number: serial || device.device_serial_number,
      battery_level: battery,
      device_status: device_status || device.device_status,
    });
    return { id: device.id, created: false };
  }

  if (!serial) {
    throw new AppError('gps_device : device_serial_number requis pour créer un GPS.');
  }

  const created = await GPSDevice.create({
    container_id: containerId,
    device_serial_number: serial,
    battery_level: battery,
    device_status: device_status || 'active',
  });
  return { id: created.id, created: true };
}

/** Resolve all related entities for a mission import payload. */
export async function resolveAllMissionEntities(
  body: Record<string, unknown>,
): Promise<ResolvedEntities> {
  const site = await resolveSite(body);
  const driver = await resolveUser(body, 'driver');
  const technician = await resolveUser(body, 'technician');
  const container = await resolveContainer(body);

  return {
    site_id: site.id,
    driver_id: driver.id,
    technician_id: technician.id,
    container_id: container.container_id,
    gps_device_id: container.gps_device_id,
    created: {
      site: site.created,
      driver: driver.created,
      technician: technician.created,
      container: container.created.container,
      gps_device: container.created.gps,
    },
  };
}
