import { Mission, Site, User, MissionFile } from '../models/index.js';
import { resolveMissionFromImport, buildImportTemplate } from './missionImportService.js';
import { persistMissionEquipment } from './missionEquipmentService.js';
import { applyMissionAssigned, notifyMissionAssigned } from './missionWorkflowService.js';

const normalizeMissionPayload = (data: any) => ({
  status: data.status || 'pending',
  scheduled_start_date: data.scheduled_start_date,
  scheduled_end_date: data.scheduled_end_date,
  start_date: data.start_date,
  end_date: data.end_date,
  technician_id: data.technician_id,
  driver_id: data.driver_id,
  equipment_list: Array.isArray(data.equipment_list) ? data.equipment_list : [],
  container_id: data.container_id,
  site_id: data.site_id,
});

export class MissionService {
  static async createMission(data: any) {
    const { equipment_list: rawEquipment, ...rest } = data;
    const mission = await Mission.create(
      normalizeMissionPayload({ ...rest, equipment_list: [] }),
    );
    const equipment_list = await persistMissionEquipment(
      rawEquipment,
      mission.id,
      data.container_id,
    );
    await mission.update({ equipment_list });
    const full = await Mission.findByPk(mission.id, { include: [{ model: Site }] });
    if (full) {
      await applyMissionAssigned(full);
      await notifyMissionAssigned(full, full.Site?.name);
    }
    return full || mission.reload();
  }

  static async createMissionFromJson(data: any, adminId: string) {
    const fileFormat =
      data.file_format && typeof data.file_format === 'object'
        ? data.file_format
        : data;

    const resolved = await resolveMissionFromImport(data);
    const reference =
      resolved.reference ||
      data.reference ||
      `mission-import-${Date.now()}`;

    const { equipment_list: rawEquipment, resolved_entities, ...missionFields } = resolved;
    const mission = await Mission.create(
      normalizeMissionPayload({ ...missionFields, equipment_list: [] }),
    );
    const equipment_list = await persistMissionEquipment(
      rawEquipment,
      mission.id,
      missionFields.container_id,
    );
    await mission.update({ equipment_list });

    const missionFile = await MissionFile.create({
      reference,
      file_format: fileFormat,
      imported_by: adminId,
      mission_id: mission.id,
    });

    const full = await Mission.findByPk(mission.id, { include: [{ model: Site }] });
    if (full) {
      await applyMissionAssigned(full);
      await notifyMissionAssigned(full, full.Site?.name);
    }

    return {
      missionFile,
      mission: full || (await mission.reload()),
      resolved_entities,
      equipment_list,
    };
  }

  static async getImportTemplate() {
    return buildImportTemplate();
  }

  static async getAllMissions(query: any, userRole: string, userId: string) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;
    const where: any = {};

    if (userRole === 'technician') where.technician_id = userId;
    else if (userRole === 'driver') where.driver_id = userId;

    if (query.status) where.status = query.status;

    const { count, rows } = await Mission.findAndCountAll({
      where,
      include: [
        { model: User, as: 'technician', attributes: ['id', 'full_name', 'email', 'phone'] },
        { model: User, as: 'driver', attributes: ['id', 'full_name', 'email', 'phone'] },
        { model: Site, attributes: ['id', 'name', 'address', 'latitude', 'longitude'] },
      ],
      limit,
      offset,
      order: [['scheduled_start_date', 'ASC']],
    });

    return {
      missions: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
    };
  }

  static async getMissionById(id: string, userRole: string, userId: string) {
    const mission = await Mission.findByPk(id, {
      include: [
        { model: User, as: 'technician' },
        { model: User, as: 'driver' },
        { model: Site },
      ],
    });
    if (!mission) throw new Error('Mission not found');
    if (userRole !== 'admin' && mission.technician_id !== userId && mission.driver_id !== userId) {
      throw new Error('Forbidden');
    }
    return mission;
  }

  static async updateMission(id: string, data: any, userRole: string) {
    if (userRole !== 'admin') throw new Error('Forbidden');
    const mission = await Mission.findByPk(id);
    if (!mission) throw new Error('Mission not found');
    await mission.update(normalizeMissionPayload({ ...mission.toJSON(), ...data }));
    return mission;
  }

  static async deleteMission(id: string, userRole: string) {
    if (userRole !== 'admin') throw new Error('Forbidden');
    const mission = await Mission.findByPk(id);
    if (!mission) throw new Error('Mission not found');
    await mission.destroy();
    return true;
  }

  static async updateStatus(id: string, status: string, userRole: string, userId: string) {
    const mission = await Mission.findByPk(id);
    if (!mission) throw new Error('Mission not found');
    if (userRole !== 'admin' && mission.technician_id !== userId && mission.driver_id !== userId) {
      throw new Error('Forbidden');
    }

    const allowed: Record<string, string[]> = {
      pending: ['in-progress'],
      'in-progress': ['completed'],
      completed: [],
    };

    if (!allowed[mission.status]?.includes(status)) {
      throw new Error(`Invalid status transition from ${mission.status} to ${status}`);
    }

    const updates: any = { status };
    if (status === 'in-progress') updates.start_date = new Date();
    if (status === 'completed') updates.end_date = new Date();

    await mission.update(updates);
    return mission;
  }
}
