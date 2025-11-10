import { Router } from 'express';
import participantsController from '../controllers/participants.controller';
import requireAuth from '../middlewares/requireAuth';

const router = Router();

router.post('/', requireAuth, participantsController.create);
router.get('/', requireAuth, participantsController.list);
router.get('/:id', requireAuth, participantsController.getById);

export default router;


