import { Request, Response, NextFunction } from 'express';
import { IPermissionService } from '../types/rbac/permission.service.interface';

/**
 * Factory del controller de permisos.
 * Solo lectura — los permisos se gestionan mediante el seeder.
 * Recibe el servicio como dependencia para facilitar el testeo unitario.
 */
export const crearPermissionController = (servicio: IPermissionService) => ({

  /** Devuelve todos los permisos */
  listar: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permisos = await servicio.obtenerTodos();
      res.json(permisos);
    } catch (error) {
      next(error);
    }
  },

  /** Devuelve un permiso por ID */
  obtener: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permiso = await servicio.obtenerPorId(req.params.id);
      if (!permiso) {
        res.status(404).json({ message: 'Permiso no encontrado' });
        return;
      }
      res.json(permiso);
    } catch (error) {
      next(error);
    }
  },
});
