import { Op } from 'sequelize';
import { Mission, Site } from '../models/index.js';
import {
  notifyMissionStarting,
} from '../services/missionWorkflowService.js';

const CHECK_MS = 60_000;
const WINDOW_MINUTES = 120;

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startMissionReminderScheduler() {
  if (intervalId) return;

  const tick = async () => {
    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() - WINDOW_MINUTES * 60 * 1000);

      const missions = await Mission.findAll({
        where: {
          status: 'pending',
          reminder_sent_at: { [Op.is]: null },
          scheduled_start_date: {
            [Op.lte]: now,
            [Op.gte]: windowStart,
          },
        },
        include: [{ model: Site, attributes: ['name'] }],
      });

      for (const mission of missions) {
        await notifyMissionStarting(mission);
        await mission.update({ reminder_sent_at: new Date() });
        console.log(`⏰ Mission reminder sent: ${mission.id}`);
      }
    } catch (err) {
      console.error('Mission reminder scheduler error:', err);
    }
  };

  tick();
  intervalId = setInterval(tick, CHECK_MS);
  console.log('✅ Mission reminder scheduler started');
}

export function stopMissionReminderScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
