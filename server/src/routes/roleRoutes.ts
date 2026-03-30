import { Router } from 'express';
import * as roleController from '../controllers/roleController';
import { verificarToken } from '../middlewares/auth';
import { verificarSuperAdmin } from '../middlewares/verificarSuperAdmin';

/**
 * Router para el recurso Roles.
 * Solo lectura y protegido — solo accesible para superadmin.
 */
const router = Router();

// Todas las rutas requieren autenticación y rol superadmin
router.use(verificarToken);
router.use(verificarSuperAdmin);

/** Obtener todos los roles */
router.get('/', roleController.listar);

/** Obtener un rol por ID */
router.get('/:id', roleController.obtener);

export default router;