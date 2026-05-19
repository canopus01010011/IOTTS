import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation/validate.js';
import { createUserSchema, updateUserSchema } from '../middleware/validation/userValidation.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createUserSchema), UserController.createUser);
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', validate(updateUserSchema), UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;