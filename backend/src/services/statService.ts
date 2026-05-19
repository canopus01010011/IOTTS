import { Mission, User, Equipment } from '../models/index.js';
import { Op } from 'sequelize';

export class StatService {
  static async getDashboardStats() {
    const totalMissions = await Mission.count();
    const totalTechnicians = await User.count({ where: { role: 'technician' } });
    const totalDrivers = await User.count({ where: { role: 'driver' } });
    const totalEquipment = await Equipment.count();

    const completedMissions = await Mission.count({ where: { status: 'completed' } });
    const pendingMissions = await Mission.count({ where: { status: 'pending' } });
    const inProgressMissions = await Mission.count({ where: { status: 'in-progress' } });

    const equipmentInUse = await Equipment.count({ where: { equipment_status: 'in_use' } });
    const equipmentAvailable = await Equipment.count({ where: { equipment_status: 'available' } });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const missionsThisMonth = await Mission.count({
      where: { creation_date: { [Op.gte]: startOfMonth } },
    });

    return {
      totalMissions,
      totalTechnicians,
      totalDrivers,
      totalEquipment,
      completedMissions,
      pendingMissions,
      inProgressMissions,
      equipmentInUse,
      equipmentAvailable,
      missionsThisMonth,
      completionRate: totalMissions > 0
        ? ((completedMissions / totalMissions) * 100).toFixed(1)
        : 0,
    };
  }

  static async getMissionsPerDay(days: number = 30) {
    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const count = await Mission.count({
        where: {
          creation_date: {
            [Op.gte]: date,
            [Op.lt]: nextDate,
          },
        },
      });

      result.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    return result;
  }

  static async getTopTechnicians(limit: number = 5) {
    const technicians = await User.findAll({
      where: { role: 'technician' },
      attributes: ['id', 'full_name'],
    });

    const result = [];

    for (const tech of technicians) {
      const completedCount = await Mission.count({
        where: {
          technician_id: tech.id,
          status: 'completed',
        },
      });

      result.push({
        id: tech.id,
        name: tech.full_name,
        completedMissions: completedCount,
      });
    }

    return result.sort((a, b) => b.completedMissions - a.completedMissions).slice(0, limit);
  }

  static async getTopDrivers(limit: number = 5) {
    const drivers = await User.findAll({
      where: { role: 'driver' },
      attributes: ['id', 'full_name'],
    });

    const result = [];

    for (const driver of drivers) {
      const missionCount = await Mission.count({
        where: {
          driver_id: driver.id,
          status: 'completed',
        },
      });

      result.push({
        id: driver.id,
        name: driver.full_name,
        completedMissions: missionCount,
      });
    }

    return result.sort((a, b) => b.completedMissions - a.completedMissions).slice(0, limit);
  }

}
