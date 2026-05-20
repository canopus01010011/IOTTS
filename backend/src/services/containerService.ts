import { Container } from '../models/index.js';
import { Op } from 'sequelize';

export class ContainerService {
  static async createContainer(data: {
    qr_code: string;
    capacity: number;
    status?: 'available' | 'assigned' | 'in_transit' | 'delivered' | 'maintenance';
  }) {
    return await Container.create(data);
  }

  static async getAllContainers(query: Record<string, unknown>) {
    const page = parseInt(String(query.page)) || 1;
    const limit = parseInt(String(query.limit)) || 50;
    const offset = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      const term = `%${String(query.search)}%`;
      where[Op.or] = [
        { qr_code: { [Op.iLike]: term } },
        { id: { [Op.iLike]: term } },
      ];
    }

    const { count, rows } = await Container.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      containers: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
    };
  }

  static async getContainerById(id: string) {
    const container = await Container.findByPk(id);
    if (!container) throw new Error('Container not found');
    return container;
  }

  static async updateContainer(
    id: string,
    data: Partial<{
      qr_code: string;
      capacity: number;
      status: 'available' | 'assigned' | 'in_transit' | 'delivered' | 'maintenance';
    }>,
    userRole: string,
  ) {
    if (userRole !== 'admin') throw new Error('Forbidden');
    const container = await Container.findByPk(id);
    if (!container) throw new Error('Container not found');
    await container.update(data);
    return container;
  }

  static async deleteContainer(id: string, userRole: string) {
    if (userRole !== 'admin') throw new Error('Forbidden');
    const container = await Container.findByPk(id);
    if (!container) throw new Error('Container not found');
    await container.destroy();
    return true;
  }
}
