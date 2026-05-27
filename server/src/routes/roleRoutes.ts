import { Router } from 'express';
import { RoleService } from '../services/rbac/role.service';
import { crearRoleController } from '../controllers/roleController';
import { verificarToken } from '../middlewares/auth';
import { verificarSuperAdmin } from '../middlewares/verificarSuperAdmin';

/**
 * Router para el recurso Roles.
 * Solo lectura y protegido — solo accesible para superadmin.
 */
const router = Router();
const controller = crearRoleController(new RoleService());

// Todas las rutas requieren autenticación y rol superadmin
router.use(verificarToken);
router.use(verificarSuperAdmin);

router.get('/',    controller.listar);
router.get('/:id', controller.obtener);

export default router;
