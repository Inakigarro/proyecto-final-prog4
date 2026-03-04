import { Router } from 'express';
import * as roleController from '../controllers/roleController';
import { verificarToken } from '../middlewares/auth';

const router = Router();

router.use(verificarToken);

router.get('/', roleController.listar);
router.get('/:id', roleController.obtener);
router.post('/', roleController.crear);
router.put('/:id', roleController.actualizar);
router.delete('/:id', roleController.eliminar);

export default router;
