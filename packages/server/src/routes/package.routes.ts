import { Router } from 'express';
import * as packageController from '../controllers/package.controller';

const router = Router();

router.get('/', packageController.getPackages);
router.get('/categories', packageController.getCategories);
router.get('/:id', packageController.getPackageById);
router.get('/:id/available-slots', packageController.getAvailableSlots);

export default router;
