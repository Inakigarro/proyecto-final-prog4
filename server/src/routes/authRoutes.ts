import { Router } from 'express';
import * as authController from '../controllers/authController';
import { verificarToken } from '../middlewares/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
// Logout requiere estar autenticado para registrar quién cierra sesión
router.post('/logout', verificarToken, authController.logout);

export default router;
