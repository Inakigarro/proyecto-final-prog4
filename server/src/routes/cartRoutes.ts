import { Router, Request, Response } from 'express';
import { CartService } from '../services/rbac/cart.service';
import { crearCartController } from '../controllers/cartController';
import { verificarToken } from '../middlewares/auth';
import { validar } from '../middlewares/validar';
import { ValidarCarritoSchema, CheckoutSchema } from '../schemas/cart.schemas';
import PaymentMethod from '../models/paymentMethod';

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

// /payment-methods: público — lista los métodos de pago activos
router.get('/payment-methods', async (_req: Request, res: Response) => {
  const metodos = await PaymentMethod.find({ activo: true }).lean();
  res.json(
    metodos.map((m) => ({
      id: m._id.toString(),
      nombre: m.nombre,
      descripcion: m.descripcion,
    }))
  );
});

// /validate: público — solo lectura de precios y stock, sin persistir
router.post('/validate', validar(ValidarCarritoSchema), controller.validar);

// /checkout: requiere usuario autenticado, persiste la orden
router.post('/checkout', verificarToken, validar(CheckoutSchema), controller.checkout);

export default router;