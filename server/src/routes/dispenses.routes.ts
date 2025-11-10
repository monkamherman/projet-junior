import { Router } from 'express';
import dispensesController from '../controllers/dispenses.controller';
import requireAuth from '../middlewares/requireAuth';

const router = Router();

router.post('/', requireAuth, dispensesController.create);
router.get('/', requireAuth, dispensesController.list);
router.get('/:id', requireAuth, dispensesController.getById);

export default router;


