import { Router } from 'express';
import { crearSlideController } from '../controllers/slideController';
import { SlideService } from '../services/rbac/slide.service';
import { verificarToken } from '../middlewares/auth';
import { verificarRoles } from '../middlewares/verificarRoles';
import { validar } from '../middlewares/validar';
import { CrearSlideSchema, ActualizarSlideSchema } from '../schemas/slide.schemas';
import { uploadSlideImagen } from '../config/multer';
import { ROL_DUENO, ROL_SUPERADMIN } from '../config/constants';

/**
 * Router del recurso Slide.
 * GET son públicos (los consume el home anónimo); las mutaciones requieren
 * auth + rol superadmin o dueño, mismo criterio que productos y promociones.
 */
const router = Router();
const controller = crearSlideController(new SlideService());

const soloAdmin = [verificarToken, verificarRoles(ROL_SUPERADMIN, ROL_DUENO)];

router.get('/',     controller.listar);
router.get('/:id',  controller.obtener);

router.post(
  '/imagen',
  ...soloAdmin,
  uploadSlideImagen.single('imagen'),
  controller.subirImagen,
);
router.post('/',    ...soloAdmin, validar(CrearSlideSchema), controller.crear);
router.put('/:id',  ...soloAdmin, validar(ActualizarSlideSchema), controller.actualizar);
router.delete('/:id', ...soloAdmin, controller.eliminar);

export default router;
