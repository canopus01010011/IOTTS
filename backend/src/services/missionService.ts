import { Mission, Site, User, MissionFile } from '../models/index.js';

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
    return Mission.create(normalizeMissionPayload(data));
  }

  static async createMissionFromJson(data: any, adminId: string) {
    const missionData = data.file_format || data.mission || data;
    const missionFile = await MissionFile.create({
      reference: data.reference || `mission-import-${Date.now()}`,
      file_format: missionData,
      imported_by: adminId,
    });

    const mission = await Mission.create(normalizeMissionPayload(missionData));
    await missionFile.update({ mission_id: mission.id });

    return { missionFile, mission };
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
        { model: User, as: 'technician', attributes: ['id', 'full_name', 'email'] },
        { model: User, as: 'driver', attributes: ['id', 'full_name', 'email'] },
        { model: Site, attributes: ['id', 'name', 'address'] },
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
