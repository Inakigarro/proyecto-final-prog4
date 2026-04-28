import { Router } from 'express';
import * as cartController from '../controllers/cartController';
import { verificarToken } from '../middlewares/auth';

const router = Router();

/**
 * Todas las rutas del carrito requieren usuario autenticado.
 * El carrito es híbrido: el frontend lo mantiene en memoria y consume
 * estos endpoints para validar el estado y para confirmar la compra.
 */
router.use(verificarToken);

router.post('/validate', cartController.validar);
router.post('/checkout', cartController.checkout);

export default router;