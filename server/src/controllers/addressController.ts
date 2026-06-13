import { Response, NextFunction } from 'express';
import { IAddressService } from '../services/rbac/address.service.interface';
import { RequestConUsuario } from '../types';

/**
 * Factory del controller de direcciones.
 * Recibe el servicio como dependencia para facilitar el testeo unitario.
 */
export const crearAddressController = (servicio: IAddressService) => ({

  /** Devuelve las direcciones activas del usuario autenticado */
  listarMias: async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      const direcciones = await servicio.obtenerPorUsuario(req.usuario!.id);
      res.json(direcciones);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Elimina lógicamente una dirección propia del usuario autenticado.
   * Devuelve 404 si la dirección no existe o pertenece a otro usuario
   * (no se diferencia para no filtrar información de existencia).
   */
  eliminar: async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eliminado = await servicio.eliminar(req.params.id, req.usuario!.id);
      if (!eliminado) {
        res.status(404).json({ message: 'Dirección no encontrada' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
});
