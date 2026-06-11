import { Router } from 'express';
import { PromotionService } from '../services/rbac/promotion.service';
import { crearPromotionController } from '../controllers/promotionController';
import { verificarToken } from '../middlewares/auth';
import { verificarSuperAdmin } from '../middlewares/verificarSuperAdmin';

const router = Router();
const controller = crearPromotionController(new PromotionService());

// Lectura: pública (alimenta la page de promociones del frontend)
router.get('/',              controller.listar);
router.get('/:id',           controller.obtenerPorId);
router.get('/:id/productos', controller.obtenerProductos);

// Mutaciones: solo superadmin
router.post('/',      verificarToken, verificarSuperAdmin, controller.crear);
router.put('/:id',    verificarToken, verificarSuperAdmin, controller.actualizar);
router.delete('/:id', verificarToken, verificarSuperAdmin, controller.eliminar);

export default router;
