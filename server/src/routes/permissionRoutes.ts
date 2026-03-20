import { Router } from 'express';
import * as permissionController from '../controllers/permissionController';

/**
 * Router para el recurso Permisos.
 * Define las rutas HTTP y las asocia a sus respectivos controladores.
 */
const router = Router();

router.get('/', permissionController.listar);
router.get('/:id', permissionController.obtener);
router.post('/', permissionController.crear);
router.put('/:id', permissionController.actualizar);
router.delete('/:id', permissionController.eliminar);

export default router;