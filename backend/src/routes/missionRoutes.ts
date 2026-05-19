import { Router } from 'express';
import { MissionController } from '../controllers/missionController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation/validate.js';
import {
  createMissionSchema,
  updateMissionSchema,
  updateStatusSchema,
} from '../middleware/validation/missionValidation.js';

const router = Router();

router.use(authenticate);

router.post('/from-json', MissionController.createMissionFromJson);
router.post('/', validate(createMissionSchema), MissionController.createMission);
router.get('/', MissionController.getAllMissions);
router.get('/:id', MissionController.getMissionById);
router.put('/:id', validate(updateMissionSchema), MissionController.updateMission);
router.delete('/:id', MissionController.deleteMission);
router.patch('/:id/status', validate(updateStatusSchema), MissionController.updateStatus);

export default router;
