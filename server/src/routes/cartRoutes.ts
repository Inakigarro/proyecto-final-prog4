import { Router } from 'express';
import { CartService } from '../services/rbac/cart.service';
import { crearCartController } from '../controllers/cartController';
import { verificarToken } from '../middlewares/auth';
import { validar } from '../middlewares/validar';
import { ValidarCarritoSchema, CheckoutSchema } from '../schemas/cart.schemas';

const router = Router();
const controller = crearCartController(new CartService());

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
router.use(verificarToken);

router.post('/validate', validar(ValidarCarritoSchema), controller.validar);
router.post('/checkout', validar(CheckoutSchema),       controller.checkout);

export default router;
