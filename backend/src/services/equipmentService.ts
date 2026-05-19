import { Equipment } from '../models/index.js';
import { Op } from 'sequelize';

const normalizeEquipmentPayload = (data: any) => ({
  model: data.model || data.name,
  type: data.type,
  serial_number: data.serial_number,
  equipment_status: data.equipment_status || data.status || 'available',
  container_id: data.container_id,
});

export class EquipmentService {
  static async createEquipment(data: any) {
    return Equipment.create(normalizeEquipmentPayload(data));
  }

  static async getAllEquipment(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;
    const where: any = {};

    if (query.equipment_status || query.status) where.equipment_status = query.equipment_status || query.status;
    if (query.type) where.type = query.type;
    if (query.search) {
      where[Op.or] = [
        { model: { [Op.iLike]: `%${query.search}%` } },
        { serial_number: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    const { count, rows } = await Equipment.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'ASC']],
    });

    return {
      equipment: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
    };
  }

  static async getEquipmentById(id: string) {
    const equipment = await Equipment.findByPk(id);
    if (!equipment) throw new Error('Equipment not found');
    return equipment;
  }

  static async updateEquipment(id: string, data: any, userRole: string) {
    if (userRole !== 'admin') throw new Error('Forbidden');
    const equipment = await Equipment.findByPk(id);
    if (!equipment) throw new Error('Equipment not found');
    await equipment.update(normalizeEquipmentPayload({ ...equipment.toJSON(), ...data }));
    return equipment;
  }

  static async deleteEquipment(id: string, userRole: string) {
    if (userRole !== 'admin') throw new Error('Forbidden');
    const equipment = await Equipment.findByPk(id);
    if (!equipment) throw new Error('Equipment not found');
    await equipment.destroy();
    return true;
  }
}
