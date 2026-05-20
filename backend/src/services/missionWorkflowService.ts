import { Mission, Container, Equipment, GPSDevice, User } from '../models/index.js';
import type { MissionEquipment } from '../models/Mission.js';
import { NotificationService } from './notificationService.js';

const SCORE_DRIVER_PICKUP = 5;
const SCORE_DRIVER_ON_TIME = 10;
const SCORE_TECH_COMPLETE = 15;
const SCORE_LATE_PENALTY = 3;

/** When a mission is created with a container — reserve assets. */
export async function applyMissionAssigned(mission: Mission) {
  if (mission.container_id) {
    const container = await Container.findByPk(mission.container_id);
    if (container && container.status === 'available') {
      await container.update({ status: 'assigned' });
    }
  }
}

/** Driver scanned container at warehouse — start delivery & simulation path. */
export async function applyPickupStatuses(mission: Mission) {
  if (mission.container_id) {
    const container = await Container.findByPk(mission.container_id);
    if (container) {
      await container.update({ status: 'in_transit' });
      const gps = await GPSDevice.findOne({ where: { container_id: container.id } });
      if (gps && gps.device_status === 'inactive') {
        await gps.update({ device_status: 'active' });
      }
    }
  }

  const list = (mission.equipment_list || []) as MissionEquipment[];
  for (const item of list) {
    if (!item.equipment_id) continue;
    const eq = await Equipment.findByPk(item.equipment_id);
    if (eq) await eq.update({ equipment_status: 'in_use' });
  }
}

/** Technician scanned mission at site — close delivery. */
export async function applyDeliveryStatuses(mission: Mission) {
  if (mission.container_id) {
    const container = await Container.findByPk(mission.container_id);
    if (container) {
      await container.update({ status: 'delivered' });
    }
    const gps = await GPSDevice.findOne({ where: { container_id: mission.container_id } });
    if (gps) {
      await gps.update({ device_status: 'inactive' });
    }
  }

  const list = (mission.equipment_list || []) as MissionEquipment[];
  for (const item of list) {
    if (!item.equipment_id) continue;
    const eq = await Equipment.findByPk(item.equipment_id);
    if (eq) await eq.update({ equipment_status: 'available' });
  }
}

export async function bumpUserScore(
  userId: string,
  delta: number,
  incrementCompleted = false,
) {
  const user = await User.findByPk(userId);
  if (!user) return;
  const current = Number(user.performance_score) || 0;
  const completed = Number(user.missions_completed) || 0;
  await user.update({
    performance_score: Math.max(0, current + delta),
    missions_completed: incrementCompleted ? completed + 1 : completed,
  });
}

export async function rewardMissionCompletion(mission: Mission) {
  const now = new Date();
  const onTime = mission.scheduled_end_date && now <= new Date(mission.scheduled_end_date);

  await bumpUserScore(
    mission.driver_id,
    onTime ? SCORE_DRIVER_ON_TIME : -SCORE_LATE_PENALTY,
    true,
  );
  await bumpUserScore(mission.technician_id, SCORE_TECH_COMPLETE, true);

  await NotificationService.sendToUser(
    mission.driver_id,
    'Mission terminée',
    `Livraison ${mission.id} confirmée sur site.`,
    { missionId: mission.id, type: 'mission_completed' },
  );
  await NotificationService.sendToUser(
    mission.technician_id,
    'Mission terminée',
    `Mission ${mission.id} clôturée. +${SCORE_TECH_COMPLETE} points.`,
    { missionId: mission.id, type: 'mission_completed' },
  );
}

export async function notifyMissionAssigned(mission: Mission, siteName?: string) {
  const label = siteName || mission.site_id;
  const start = new Date(mission.scheduled_start_date).toLocaleString('fr-FR');
  await NotificationService.sendToUser(
    mission.driver_id,
    'Nouvelle mission',
    `Mission ${mission.id} — rendez-vous à l'entrepôt à ${start}.`,
    { missionId: mission.id, type: 'mission_assigned' },
  );
  await NotificationService.sendToUser(
    mission.technician_id,
    'Nouvelle mission',
    `Mission ${mission.id} vers ${label} — début ${start}.`,
    { missionId: mission.id, type: 'mission_assigned' },
  );
}

export async function notifyMissionStarting(mission: Mission) {
  await NotificationService.sendToUser(
    mission.driver_id,
    'C\'est l\'heure — entrepôt',
    `Scannez le QR du conteneur pour démarrer la mission ${mission.id}.`,
    { missionId: mission.id, type: 'mission_start' },
  );
  await NotificationService.sendToUser(
    mission.technician_id,
    'Mission en cours de départ',
    `Le conducteur démarre la livraison ${mission.id}. Suivi GPS actif.`,
    { missionId: mission.id, type: 'mission_start' },
  );
}

export async function notifyPickupStarted(mission: Mission) {
  await NotificationService.sendToUser(
    mission.technician_id,
    'Livraison démarrée',
    `Conteneur scanné — mission ${mission.id} en cours. Suivez sur la carte.`,
    { missionId: mission.id, type: 'pickup_confirmed' },
  );
}
