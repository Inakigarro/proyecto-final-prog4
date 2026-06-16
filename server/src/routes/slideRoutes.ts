import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
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

/**
 * Wrapper de multer que mapea los errores típicos a respuestas con mensaje
 * legible. Sin esto, multer lanza al next() y el errorHandler genérico
 * responde 500 'Error interno del servidor' sin contexto.
 */
function manejarUploadSlide(req: Request, res: Response, next: NextFunction): void {
  uploadSlideImagen.single('imagen')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({
          message: 'El archivo excede el tamaño máximo permitido (5 MB).',
        });
        return;
      }
      res.status(400).json({ message: err.message });
      return;
    }
    if (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al procesar la imagen';
      res.status(400).json({ message: mensaje });
      return;
    }
    next();
  });
}

router.get('/',     controller.listar);
router.get('/:id',  controller.obtener);

router.post('/imagen', ...soloAdmin, manejarUploadSlide, controller.subirImagen);
router.post('/',       ...soloAdmin, validar(CrearSlideSchema), controller.crear);
router.put('/:id',     ...soloAdmin, validar(ActualizarSlideSchema), controller.actualizar);
router.delete('/:id',  ...soloAdmin, controller.eliminar);

export default router;
