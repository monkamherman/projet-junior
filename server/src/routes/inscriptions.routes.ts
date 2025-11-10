import { Router } from 'express';
import inscriptionsController from '../controllers/inscriptions.controller';
import requireAuth from '../middlewares/requireAuth';

const router = Router();

router.post('/', requireAuth, inscriptionsController.create);
router.get('/', requireAuth, inscriptionsController.list);
router.get('/:id', requireAuth, inscriptionsController.getById);

export default router;


