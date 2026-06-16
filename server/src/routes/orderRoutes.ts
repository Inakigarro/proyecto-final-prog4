import { Router } from 'express';
import { OrderService } from '../services/rbac/order.service';
import { crearOrderController } from '../controllers/orderController';
import { verificarToken } from '../middlewares/auth';
import { verificarRoles } from '../middlewares/verificarRoles';

const router = Router();
const controller = crearOrderController(new OrderService());

/**
 * Rutas de órdenes de compra.
 *
 * /me         — usuario autenticado: sus propias órdenes.
 * /me/:id     — usuario autenticado: detalle de una de sus órdenes.
 * /           — admin: listado de todas las órdenes del sistema.
 * /:id        — admin: detalle de cualquier orden.
 *
 * Todas requieren autenticación. Las rutas sin /me requieren rol superadmin.
 */

// Rutas del usuario autenticado
router.get('/me', verificarToken, controller.misOrdenes);
router.get('/me/:id', verificarToken, controller.miOrdenDetalle);

// Rutas de admin
router.get('/', verificarToken, verificarRoles('superadmin'), controller.listar);
router.get('/:id', verificarToken, verificarRoles('superadmin'), controller.detalle);

export default router;