import { Request, Response, NextFunction } from 'express';
import { IOrderService } from '../types/rbac/order.service.interface';
import { RequestConUsuario } from '../types';

/**
 * Factory del controller de órdenes.
 * Recibe el servicio como dependencia para facilitar el testeo.
 */
export const crearOrderController = (servicio: IOrderService) => ({

  /** GET /api/orders/me — órdenes del usuario autenticado. */
  misOrdenes: async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ordenes = await servicio.obtenerPorUsuario(req.usuario!.id);
      res.json(ordenes);
    } catch (error) {
      next(error);
    }
  },

  /** GET /api/orders/me/:id — detalle de una orden del usuario autenticado. */
  miOrdenDetalle: async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orden = await servicio.obtenerDetallePorUsuario(req.params.id, req.usuario!.id);
      if (!orden) {
        res.status(404).json({ message: 'Orden no encontrada' });
        return;
      }
      res.json(orden);
    } catch (error) {
      next(error);
    }
  },

  /** GET /api/orders — todas las órdenes del sistema (admin). */
  listar: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ordenes = await servicio.obtenerTodas();
      res.json(ordenes);
    } catch (error) {
      next(error);
    }
  },

  /** GET /api/orders/:id — detalle de cualquier orden (admin). */
  detalle: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orden = await servicio.obtenerDetalle(req.params.id);
      if (!orden) {
        res.status(404).json({ message: 'Orden no encontrada' });
        return;
      }
      res.json(orden);
    } catch (error) {
      next(error);
    }
  },
});