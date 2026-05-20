import { Op } from 'sequelize';
import { Confirmation, Mission, Report, User, Container, Site } from '../models/index.js';
import {
  applyPickupStatuses,
  applyDeliveryStatuses,
  rewardMissionCompletion,
  notifyPickupStarted,
  bumpUserScore,
} from './missionWorkflowService.js';

export interface ScanData {
  missionId?: string;
  qrCode?: string;
  userId: string;
  userRole: 'admin' | 'technician' | 'driver';
}

export class DeliveryService {
  static async processScan(data: ScanData) {
    const { userId, userRole } = data;

    if (userRole === 'driver') {
      const mission = await this.resolveDriverScan(data);
      return this.handleDriverPickup(mission, userId);
    }

    if (userRole === 'technician') {
      const missionId = data.missionId;
      if (!missionId) {
        throw new Error('Scannez le QR de la mission sur le site de livraison.');
      }
      const mission = await Mission.findByPk(missionId, {
        include: [
          { model: User, as: 'technician' },
          { model: User, as: 'driver' },
          { model: Site },
        ],
      });
      if (!mission) throw new Error('Mission not found');
      return this.handleTechnicianDelivery(mission, userId);
    }

    throw new Error('Only drivers and technicians can confirm missions');
  }

  /** Driver: container QR at warehouse, or mission QR if pending + has container. */
  private static async resolveDriverScan(data: ScanData): Promise<Mission> {
    if (data.qrCode) {
      const qr = data.qrCode.trim();
      const container = await Container.findOne({
        where: {
          [Op.or]: [{ qr_code: qr }, { id: qr }],
        },
      });
      if (!container) {
        throw new Error(`Conteneur introuvable pour le QR : ${qr}`);
      }

      const mission = await Mission.findOne({
        where: {
          container_id: container.id,
          status: 'pending',
        },
        order: [['scheduled_start_date', 'ASC']],
      });

      if (!mission) {
        throw new Error(
          'Aucune mission en attente pour ce conteneur. Vérifiez l\'assignation ou l\'horaire.',
        );
      }
      return mission;
    }

    if (data.missionId) {
      const mission = await Mission.findByPk(data.missionId);
      if (!mission) throw new Error('Mission not found');
      if (mission.status !== 'pending') {
        throw new Error('Cette mission n\'est plus en attente de prise en charge à l\'entrepôt.');
      }
      if (!mission.container_id) {
        throw new Error('Mission sans conteneur — scannez le QR du conteneur à l\'entrepôt.');
      }
      return mission;
    }

    throw new Error('Scannez le QR code du conteneur à l\'entrepôt.');
  }

  private static async handleDriverPickup(mission: Mission, driverId: string) {
    if (mission.driver_id !== driverId) {
      throw new Error('Vous n\'êtes pas le conducteur assigné à cette mission.');
    }
    if (mission.status !== 'pending') {
      throw new Error(`Mission déjà ${mission.status}. Scan entrepôt impossible.`);
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
      throw new Error('Prise en charge déjà enregistrée pour cette mission.');
    }

    await confirmation.update({
      driver_confirm_time: new Date(),
      confirmation_status: 'driver_confirmed',
    });

    await mission.update({ status: 'in-progress', start_date: new Date() });
    await applyPickupStatuses(mission);
    await bumpUserScore(mission.driver_id, 5);
    await notifyPickupStarted(mission);

    return {
      success: true,
      message:
        'Conteneur scanné à l\'entrepôt. Mission en cours — suivi GPS et simulation actifs.',
      missionId: mission.id,
      status: 'in-progress',
      nextStep: 'track_delivery',
      phase: 'pickup',
    };
  }

  private static async handleTechnicianDelivery(mission: Mission, technicianId: string) {
    if (mission.technician_id !== technicianId) {
      throw new Error('Vous n\'êtes pas le technicien assigné à cette mission.');
    }
    if (mission.status !== 'in-progress') {
      throw new Error('La mission doit être en cours (conducteur a scanné le conteneur à l\'entrepôt).');
    }

    const confirmation = await Confirmation.findOne({ where: { mission_id: mission.id } });
    if (!confirmation?.driver_confirm_time) {
      throw new Error('Le conducteur doit d\'abord scanner le conteneur à l\'entrepôt.');
    }
    if (confirmation.technician_confirm_time) {
      throw new Error('Livraison déjà confirmée sur site.');
    }

    await confirmation.update({
      technician_confirm_time: new Date(),
      confirmation_status: 'confirmed',
    });

    await mission.update({ status: 'completed', end_date: new Date() });
    await applyDeliveryStatuses(mission);
    await rewardMissionCompletion(mission);

    return {
      success: true,
      message: 'Mission terminée sur site. Scores conducteur et technicien mis à jour.',
      missionId: mission.id,
      status: 'completed',
      completedAt: mission.end_date,
      phase: 'delivery',
    };
  }

  static async getDeliveryStatus(missionId: string, userId: string, userRole: string) {
    const mission = await Mission.findByPk(missionId, {
      include: [
        { model: User, as: 'technician', attributes: ['id', 'full_name', 'performance_score', 'missions_completed'] },
        { model: User, as: 'driver', attributes: ['id', 'full_name', 'performance_score', 'missions_completed'] },
        { model: Site },
        { model: Container, attributes: ['id', 'qr_code', 'status'] },
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
      container: mission.Container
        ? { id: mission.Container.id, qr_code: mission.Container.qr_code, status: mission.Container.status }
        : null,
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
