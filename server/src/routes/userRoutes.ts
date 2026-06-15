import { Router } from 'express';
import { UserService } from '../services/rbac/user.service';
import { crearUserController } from '../controllers/userController';
import { verificarToken } from '../middlewares/auth';
import { verificarSuperAdmin } from '../middlewares/verificarSuperAdmin';
import { validar } from '../middlewares/validar';
import { ActualizarPerfilSchema } from '../schemas/user.schemas';

/**
 * Router para el recurso Usuarios.
 * Todas las rutas requieren autenticación.
 * Las rutas de escritura y listado requieren rol superadmin.
 */
const router = Router();
const controller = crearUserController(new UserService());

// Rutas del perfil propio — solo requieren estar autenticado
router.get('/me',  verificarToken,                                  controller.perfil);
router.put('/me',  verificarToken, validar(ActualizarPerfilSchema), controller.actualizarPerfil);

// Resto de rutas requieren autenticación y rol superadmin
router.use(verificarToken);
router.use(verificarSuperAdmin);

router.get('/',     controller.listar);
router.get('/:id',  controller.obtener);
router.post('/',    controller.crear);
router.put('/:id',  controller.actualizar);
router.delete('/:id', controller.eliminar);

export default router;
