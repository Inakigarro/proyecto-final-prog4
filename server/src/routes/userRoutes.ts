import { Router } from 'express';
import * as userController from '../controllers/userController';
import { verificarToken } from '../middlewares/auth';

const router = Router();

router.use(verificarToken);

// Ruta del usuario autenticado — debe ir antes de /:id para no colisionar
router.get('/me', userController.perfil);

router.get('/', userController.listar);
router.get('/:id', userController.obtener);
router.post('/', userController.crear);
router.put('/:id', userController.actualizar);
router.delete('/:id', userController.eliminar);

export default router;
