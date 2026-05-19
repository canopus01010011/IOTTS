import { Router } from 'express';
import { SiteController } from '../controllers/siteController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation/validate.js';
import { createSiteSchema, updateSiteSchema } from '../middleware/validation/siteValidation.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createSiteSchema), SiteController.createSite);
router.get('/', SiteController.getAllSites);
router.get('/:id', SiteController.getSiteById);
router.put('/:id', validate(updateSiteSchema), SiteController.updateSite);
router.delete('/:id', SiteController.deleteSite);

export default router;