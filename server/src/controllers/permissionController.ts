import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/rbac/permission.service';

const servicio = new PermissionService();

/**
 * Controlador para manejar las peticiones HTTP del recurso Permisos.
 * Solo lectura — los permisos se gestionan mediante el seeder.
 */

/** Devuelve todos los permisos */
export const listar = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const permisos = await servicio.obtenerTodos();
    res.json(permisos);
  } catch (error) {
    next(error);
  }
};

/** Devuelve un permiso por ID */
export const obtener = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const permiso = await servicio.obtenerPorId(req.params.id);
    if (!permiso) {
      res.status(404).json({ mensaje: 'Permiso no encontrado' });
      return;
    }
    res.json(permiso);
  } catch (error) {
    next(error);
  }
};