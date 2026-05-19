import { Router } from 'express';
import { EquipmentController } from '../controllers/equipmentController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation/validate.js';
import { createEquipmentSchema, updateEquipmentSchema } from '../middleware/validation/equipmentValidation.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createEquipmentSchema), EquipmentController.createEquipment);
router.get('/', EquipmentController.getAllEquipment);
router.get('/:id', EquipmentController.getEquipmentById);
router.put('/:id', validate(updateEquipmentSchema), EquipmentController.updateEquipment);
router.delete('/:id', EquipmentController.deleteEquipment);

export default router;