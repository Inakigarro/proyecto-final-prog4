import { Response, NextFunction } from 'express';
import { ICartService } from '../types/rbac/cart.service.interface';
import { ValidarCarritoDto, CheckoutDto } from '../types/rbac/cart.dtos';
import { RequestConUsuario } from '../types';

/**
 * Factory del controller de carrito.
 * Recibe el servicio como dependencia para facilitar el testeo unitario.
 */
export const crearCartController = (servicio: ICartService) => ({

  /**
   * POST /api/cart/validate
   * Valida el carrito enviado por el frontend contra la base.
   * Devuelve precios actuales, stock disponible y total.
   */
  validar: async (
    req: RequestConUsuario,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto = req.body as ValidarCarritoDto;
      const resultado = await servicio.validateCart(dto);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/cart/checkout
   * Confirma la compra: descuenta stock atómicamente y crea la PurchaseOrder
   * con sus PurchaseOrderDetail asociados.
   */
  checkout: async (
    req: RequestConUsuario,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.usuario) {
        res.status(401).json({ message: 'Token requerido' });
        return;
      }
      const dto = req.body as CheckoutDto;
      const orden = await servicio.checkout(req.usuario.id, dto);
      res.status(201).json(orden);
    } catch (error) {
      next(error);
    }
  },
});
