import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/rbac/role.service';

const servicio = new RoleService();

/**
 * Controlador para manejar las peticiones HTTP del recurso Roles.
 * Solo lectura — los roles se gestionan mediante el seeder.
 */

/** Devuelve todos los roles con sus permisos populados */
export const listar = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roles = await servicio.obtenerTodos();
    res.json(roles);
  } catch (error) {
    next(error);
  }
};

/** Devuelve un rol por ID con sus permisos populados */
export const obtener = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rol = await servicio.obtenerPorId(req.params.id);
    if (!rol) {
      res.status(404).json({ mensaje: 'Rol no encontrado' });
      return;
    }
    res.json(rol);
  } catch (error) {
    next(error);
  }
};