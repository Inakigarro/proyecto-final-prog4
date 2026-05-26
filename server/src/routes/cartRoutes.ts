import { Router } from 'express';
import * as cartController from '../controllers/cartController';
import { verificarToken } from '../middlewares/auth';

const router = Router();

/**
 * El carrito es híbrido: el frontend lo mantiene en memoria y consume
 * estos endpoints para validar el estado y para confirmar la compra.
 *
 * /validate es público: permite que cualquier visitante arme su carrito
 * y vea precios y stock actualizados sin necesidad de loguearse.
 *
 * /checkout sí requiere usuario autenticado, ya que confirma la compra
 * y crea la orden asociada al usuario.
 */
router.post('/validate', cartController.validar);
router.post('/checkout', verificarToken, cartController.checkout);

export default router;