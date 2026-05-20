import { Router } from 'express';
import { ContainerController } from '../controllers/containerController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation/validate.js';
import {
  createContainerSchema,
  updateContainerSchema,
} from '../middleware/validation/containerValidation.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createContainerSchema), ContainerController.createContainer);
router.get('/', ContainerController.getAllContainers);
router.get('/:id', ContainerController.getContainerById);
router.put('/:id', validate(updateContainerSchema), ContainerController.updateContainer);
router.delete('/:id', ContainerController.deleteContainer);

export default router;
