import { Router } from 'express';
import { PromotionService } from '../services/rbac/promotion.service';
import { crearPromotionController } from '../controllers/promotionController';
import { verificarToken } from '../middlewares/auth';
import { verificarRoles } from '../middlewares/verificarRoles';
import { ROL_SUPERADMIN, ROL_DUENO } from '../config/constants';

const router = Router();
const controller = crearPromotionController(new PromotionService());

// Lectura: pública (alimenta la page de promociones del frontend)
router.get('/',              controller.listar);
router.get('/:id',           controller.obtenerPorId);
router.get('/:id/productos', controller.obtenerProductos);

// Mutaciones: superadmin o dueño
router.post('/',      verificarToken, verificarRoles(ROL_SUPERADMIN, ROL_DUENO), controller.crear);
router.put('/:id',    verificarToken, verificarRoles(ROL_SUPERADMIN, ROL_DUENO), controller.actualizar);
router.delete('/:id', verificarToken, verificarRoles(ROL_SUPERADMIN, ROL_DUENO), controller.eliminar);

export default router;
