import { Request, Response, NextFunction } from 'express';
import { IPromotionService } from '../types/rbac/promotion.service.interface';
import {
  CrearPromotionDto,
  ActualizarPromotionDto,
} from '../types/promotion.dtos';

/**
 * Factory del controller de promociones.
 * Recibe el servicio como dependencia para facilitar el testeo unitario.
 */
export const crearPromotionController = (servicio: IPromotionService) => ({

  /** Devuelve todas las promociones activas */
  listar: async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const promociones = await servicio.buscarTodas();
      res.json(promociones);
    } catch (error) {
      next(error);
    }
  },

  /** Devuelve una promoción activa por ID */
  obtenerPorId: async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const promocion = await servicio.buscarPorId(req.params.id);
      if (!promocion) {
        res.status(404).json({ message: 'Promoción no encontrada' });
        return;
      }
      res.json(promocion);
    } catch (error) {
      next(error);
    }
  },

  /** Devuelve los productos asociados a una promoción, populados */
  obtenerProductos: async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const productos = await servicio.obtenerProductosDePromocion(req.params.id);
      if (productos === null) {
        res.status(404).json({ message: 'Promoción no encontrada' });
        return;
      }
      res.json(productos);
    } catch (error) {
      next(error);
    }
  },

  /** Crea una nueva promoción */
  crear: async (
    req: Request<{}, {}, CrearPromotionDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const promocion = await servicio.crear(req.body);
      res.status(201).json(promocion);
    } catch (error) {
      next(error);
    }
  },

  /** Actualiza parcialmente una promoción por ID */
  actualizar: async (
    req: Request<{ id: string }, {}, ActualizarPromotionDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const promocion = await servicio.actualizar(req.params.id, req.body);
      if (!promocion) {
        res.status(404).json({ message: 'Promoción no encontrada' });
        return;
      }
      res.json(promocion);
    } catch (error) {
      next(error);
    }
  },

  /** Desactiva una promoción por ID (borrado lógico) */
  eliminar: async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const eliminada = await servicio.eliminar(req.params.id);
      if (!eliminada) {
        res.status(404).json({ message: 'Promoción no encontrada' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
});
