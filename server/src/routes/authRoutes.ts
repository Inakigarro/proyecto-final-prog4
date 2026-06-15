import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController';
import { validar } from '../middlewares/validar';
import { verificarToken } from '../middlewares/auth';
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  RefreshTokenSchema,
  CambiarPasswordRequestSchema,
  CambiarPasswordConfirmSchema,
} from '../schemas/auth.schemas';

const router = Router();

// Limitadores independientes por tipo de operación (contadores separados por IP)
const limiterRegistro = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Demasiados intentos de registro. Intentá de nuevo en 15 minutos.' },
});

const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Demasiados intentos de inicio de sesión. Intentá de nuevo en 15 minutos.' },
});

const limiterPassword = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { mensaje: 'Demasiados intentos. Intentá de nuevo en 15 minutos.' },
});

router.post('/register',        limiterRegistro,  validar(RegisterSchema),       authController.register);
router.post('/login',           limiterLogin,     validar(LoginSchema),          authController.login);
router.post('/refresh',                           validar(RefreshTokenSchema),   authController.refreshToken);
router.post('/logout',                            validar(RefreshTokenSchema),   authController.logout);
router.post('/forgot-password', limiterPassword,  validar(ForgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password',  limiterPassword,  validar(ResetPasswordSchema),  authController.resetPassword);

// Cambio de contraseña desde el perfil (con verificación por email)
router.post(
  '/password/change/request',
  limiterPassword,
  verificarToken,
  validar(CambiarPasswordRequestSchema),
  authController.solicitarCambioPassword,
);
router.post(
  '/password/change/confirm',
  limiterPassword,
  verificarToken,
  validar(CambiarPasswordConfirmSchema),
  authController.confirmarCambioPassword,
);

export default router;
