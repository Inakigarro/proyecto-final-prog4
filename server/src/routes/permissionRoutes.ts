import { Router } from 'express';
import { PermissionService } from '../services/rbac/permission.service';
import { crearPermissionController } from '../controllers/permissionController';
import { verificarToken } from '../middlewares/auth';
import { verificarSuperAdmin } from '../middlewares/verificarSuperAdmin';

/**
 * Router para el recurso Permisos.
 * Solo lectura y protegido — solo accesible para superadmin.
 */
const router = Router();
const controller = crearPermissionController(new PermissionService());

// Todas las rutas requieren autenticación y rol superadmin
router.use(verificarToken);
router.use(verificarSuperAdmin);

router.get('/',    controller.listar);
router.get('/:id', controller.obtener);

export default router;
