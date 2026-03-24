import { Router } from 'express';
import * as userController from '../controllers/userController';
import { verificarToken } from '../middlewares/auth';
import { verificarSuperAdmin } from '../middlewares/verificarSuperAdmin';

/**
 * Router para el recurso Usuarios.
 * Todas las rutas requieren autenticación.
 * Las rutas de escritura y listado requieren rol superadmin.
 */
const router = Router();

// Ruta del perfil propio — solo requiere estar autenticado
router.get('/me', verificarToken, userController.perfil);

// Resto de rutas requieren autenticación y rol superadmin
router.use(verificarToken);
router.use(verificarSuperAdmin);

router.get('/', userController.listar);
router.get('/:id', userController.obtener);
router.post('/', userController.crear);
router.put('/:id', userController.actualizar);
router.delete('/:id', userController.eliminar);

export default router;