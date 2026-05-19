import { Confirmation, Mission, Report, User } from '../models/index.js';

interface ScanData {
  missionId: string;
  userId: string;
  userRole: 'admin' | 'technician' | 'driver';
}

export class DeliveryService {
  static async processScan(data: ScanData) {
    const { missionId, userId, userRole } = data;

    const mission = await Mission.findByPk(missionId, {
      include: [
        { model: User, as: 'technician' },
        { model: User, as: 'driver' },
      ],
    });

    if (!mission) throw new Error('Mission not found');
    if (mission.status === 'completed') throw new Error('Mission already completed');

    if (userRole === 'driver') {
      return this.handleDriverConfirmation(mission, userId);
    }

    if (userRole === 'technician') {
      return this.handleTechnicianConfirmation(mission, userId);
    }

    throw new Error('Only drivers and technicians can confirm missions');
  }

  private static async handleDriverConfirmation(mission: Mission, driverId: string) {
    if (mission.driver_id !== driverId) {
      throw new Error('You are not assigned as driver for this mission');
    }

    const [confirmation, created] = await Confirmation.findOrCreate({
      where: { mission_id: mission.id },
      defaults: {
        mission_id: mission.id,
        driver_confirm_time: new Date(),
        confirmation_status: 'driver_confirmed',
      },
    });

    if (!created && confirmation.driver_confirm_time) {
      throw new Error('Driver already confirmed this mission');
    }

    await confirmation.update({
      driver_confirm_time: new Date(),
      confirmation_status: 'driver_confirmed',
    });
    await mission.update({ status: 'in-progress', start_date: new Date() });

    return {
      success: true,
      message: 'Driver confirmation recorded. Waiting for technician confirmation.',
      status: mission.status,
      nextStep: 'technician_confirmation_required',
    };
  }

  private static async handleTechnicianConfirmation(mission: Mission, technicianId: string) {
    if (mission.technician_id !== technicianId) {
      throw new Error('You are not assigned as technician for this mission');
    }

    const confirmation = await Confirmation.findOne({ where: { mission_id: mission.id } });
    if (!confirmation?.driver_confirm_time) {
      throw new Error('Driver must confirm before technician');
    }
    if (confirmation.technician_confirm_time) {
      throw new Error('Technician already confirmed this mission');
    }

    await confirmation.update({
      technician_confirm_time: new Date(),
      confirmation_status: 'confirmed',
    });
    await mission.update({ status: 'completed', end_date: new Date() });

    await Report.findOrCreate({
      where: { mission_id: mission.id },
      defaults: {
        mission_id: mission.id,
        report_date: new Date(),
        description: 'Mission completed',
        delivery_photo_url: [],
      },
    });

    return {
      success: true,
      message: 'Mission confirmed successfully.',
      status: mission.status,
      completedAt: mission.end_date,
    };
  }

  static async getDeliveryStatus(missionId: string, userId: string, userRole: string) {
    const mission = await Mission.findByPk(missionId, {
      include: [
        { model: User, as: 'technician', attributes: ['id', 'full_name'] },
        { model: User, as: 'driver', attributes: ['id', 'full_name'] },
      ],
    });

    if (!mission) throw new Error('Mission not found');
    if (userRole !== 'admin' && mission.technician_id !== userId && mission.driver_id !== userId) {
      throw new Error('You are not authorized to view this delivery status');
    }

    const confirmation = await Confirmation.findOne({ where: { mission_id: missionId } });
    const report = await Report.findOne({ where: { mission_id: missionId } });

    return {
      missionId: mission.id,
      status: mission.status,
      confirmation: {
        driver: {
          confirmed: !!confirmation?.driver_confirm_time,
          timestamp: confirmation?.driver_confirm_time,
        },
        technician: {
          confirmed: !!confirmation?.technician_confirm_time,
          timestamp: confirmation?.technician_confirm_time,
        },
        status: confirmation?.confirmation_status || 'pending',
      },
      completedAt: mission.end_date,
      report,
    };
  }
}
