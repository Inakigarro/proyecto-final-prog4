import { Router } from 'express';
import * as permissionController from '../controllers/permissionController';
import { verificarToken } from '../middlewares/auth';
import { verificarSuperAdmin } from '../middlewares/verificarSuperAdmin';

/**
 * Router para el recurso Permisos.
 * Solo lectura y protegido — solo accesible para superadmin.
 */
const router = Router();

// Todas las rutas requieren autenticación y rol superadmin
router.use(verificarToken);
router.use(verificarSuperAdmin);

/** Obtener todos los permisos */
router.get('/', permissionController.listar);

/** Obtener un permiso por ID */
router.get('/:id', permissionController.obtener);

export default router;