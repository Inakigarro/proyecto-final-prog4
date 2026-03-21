import { Router } from 'express';
import * as permissionController from '../controllers/permissionController';

/**
 * Router para el recurso Permisos.
 * Solo lectura — los permisos se gestionan mediante el seeder.
 */
const router = Router();

/** Obtener todos los permisos */
router.get('/', permissionController.listar);

/** Obtener un permiso por ID */
router.get('/:id', permissionController.obtener);

export default router;