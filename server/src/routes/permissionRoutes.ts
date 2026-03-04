import { Router } from 'express';
import * as permissionController from '../controllers/permissionController';
import { verificarToken } from '../middlewares/auth';

const router = Router();

// Todas las rutas de permisos requieren autenticación
router.use(verificarToken);

router.get('/', permissionController.listar);
router.get('/:id', permissionController.obtener);
router.post('/', permissionController.crear);
router.put('/:id', permissionController.actualizar);
router.delete('/:id', permissionController.eliminar);

export default router;
