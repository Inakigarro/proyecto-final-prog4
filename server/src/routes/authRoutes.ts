import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController';
import { verificarToken } from '../middlewares/auth';

const router = Router();

// Máximo 10 intentos por IP cada 15 minutos en rutas sensibles
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Demasiados intentos. Intentá de nuevo en 15 minutos.' },
});

router.post('/register', limiter, authController.register);
router.post('/login', limiter, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', verificarToken, authController.logout);
router.post('/forgot-password', limiter, authController.forgotPassword);
router.post('/reset-password', limiter, authController.resetPassword);

export default router;
