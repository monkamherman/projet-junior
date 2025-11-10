import { Router } from 'express';
import parlementsController from '../controllers/parlements.controller';
import requireAuth from '../middlewares/requireAuth';

const router = Router();

router.post('/', requireAuth, parlementsController.create);
router.get('/', requireAuth, parlementsController.list);
router.get('/:id', requireAuth, parlementsController.getById);

export default router;


