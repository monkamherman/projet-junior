import { Router } from 'express';
import formationsController from '../controllers/formations.controller';
import requireAuth from '../middlewares/requireAuth';

const router = Router();

router.post('/', requireAuth, formationsController.create);
router.get('/', requireAuth, formationsController.list);
router.get('/:id', requireAuth, formationsController.getById);

export default router;


