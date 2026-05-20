import { Request, Response, NextFunction } from 'express';
import { IRoleService } from '../types/rbac/role.service.interface';

/**
 * Factory del controller de roles.
 * Solo lectura — los roles se gestionan mediante el seeder.
 * Recibe el servicio como dependencia para facilitar el testeo unitario.
 */
export const crearRoleController = (servicio: IRoleService) => ({

  /** Devuelve todos los roles con sus permisos populados */
  listar: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roles = await servicio.obtenerTodos();
      res.json(roles);
    } catch (error) {
      next(error);
    }
  },

  /** Devuelve un rol por ID con sus permisos populados */
  obtener: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rol = await servicio.obtenerPorId(req.params.id);
      if (!rol) {
        res.status(404).json({ message: 'Rol no encontrado' });
        return;
      }
      res.json(rol);
    } catch (error) {
      next(error);
    }
  },
});
