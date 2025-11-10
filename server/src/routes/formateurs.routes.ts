import { Router } from 'express';
import formateursController from '../controllers/formateurs.controller';
import requireAuth from '../middlewares/requireAuth';

const router = Router();

router.post('/', requireAuth, formateursController.create);
router.get('/', requireAuth, formateursController.list);
router.get('/:id', requireAuth, formateursController.getById);

export default router;


