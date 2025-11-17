import { Router } from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth';
import * as userController from '../controllers/dashboard/users';
import * as formationController from '../controllers/dashboard/formations';
import * as paymentController from '../controllers/dashboard/payments';
import * as certificateController from '../controllers/dashboard/certificates';

const router = Router();

// Middleware d'authentification pour toutes les routes du tableau de bord
router.use(authenticateToken);

// Routes pour la gestion des utilisateurs
router.get('/users', isAdmin, userController.getAllUsers);
router.get('/users/:id', isAdmin, userController.getUserById);
router.put('/users/:id', isAdmin, userController.updateUser);
router.delete('/users/:id', isAdmin, userController.deactivateUser);

// Routes pour la gestion des formations
router.post('/formations', isAdmin, formationController.createFormation);
router.get('/formations', formationController.getAllFormations);
router.get('/formations/:id', formationController.getFormationById);
router.put('/formations/:id', isAdmin, formationController.updateFormation);
router.delete('/formations/:id', isAdmin, formationController.deleteFormation);

// Routes pour la gestion des paiements
router.post('/payments', isAdmin, paymentController.createPayment);
router.get('/payments', isAdmin, paymentController.getAllPayments);
router.get('/payments/:id', isAdmin, paymentController.getPaymentById);
router.patch('/payments/:id/status', isAdmin, paymentController.updatePaymentStatus);

// Routes pour la gestion des attestations
router.post('/certificates/generate', isAdmin, certificateController.generateCertificateForUser);
router.get('/certificates', isAdmin, certificateController.getAllCertificates);
router.get('/certificates/:id/download', certificateController.downloadCertificate);
router.post('/certificates/:id/send', isAdmin, certificateController.sendCertificateByEmail);

export default router;
