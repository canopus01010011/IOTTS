import { Site } from '../models/index.js';
import { Op } from 'sequelize';

export class SiteService {
  static async createSite(data: any) {
    return await Site.create(data);
  }

  static async getAllSites(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;
    const where: any = {};
    if (query.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${query.search}%` } },
        { address: { [Op.iLike]: `%${query.search}%` } },
      ];
    }
    const { count, rows } = await Site.findAndCountAll({
      where,
      limit,
      offset,
      order: [['site_creation_date', 'DESC']],
    });
    return {
      sites: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
    };
  }

  static async getSiteById(id: string) {
    const site = await Site.findByPk(id);
    if (!site) throw new Error('Site not found');
    return site;
  }

  static async updateSite(id: string, data: any, userRole: string) {
    if (userRole !== 'admin') throw new Error('Forbidden');
    const site = await Site.findByPk(id);
    if (!site) throw new Error('Site not found');
    await site.update(data);
    return site;
  }

  static async deleteSite(id: string, userRole: string) {
    if (userRole !== 'admin') throw new Error('Forbidden');
    const site = await Site.findByPk(id);
    if (!site) throw new Error('Site not found');
    await site.destroy();
    return true;
  }
}
