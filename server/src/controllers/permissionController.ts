import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/rbac/permission.service';
import { CrearPermisoDto, ActualizarPermisoDto } from '../types';

const servicio = new PermissionService();

/**
 * Controlador para manejar las peticiones HTTP del recurso Permisos.
 * Delega la lógica de negocio al PermissionService.
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

/** Crea un nuevo permiso */
export const crear = async (req: Request<{}, {}, CrearPermisoDto>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const permiso = await servicio.crear(req.body);
    res.status(201).json(permiso);
  } catch (error) {
    next(error);
  }
};

/** Actualiza un permiso por ID */
export const actualizar = async (req: Request<{ id: string }, {}, ActualizarPermisoDto>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const permiso = await servicio.actualizar(req.params.id, req.body);
    if (!permiso) {
      res.status(404).json({ mensaje: 'Permiso no encontrado' });
      return;
    }
    res.json(permiso);
  } catch (error) {
    next(error);
  }
};

/** Elimina un permiso por ID */
export const eliminar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const eliminado = await servicio.eliminar(req.params.id);
    if (!eliminado) {
      res.status(404).json({ mensaje: 'Permiso no encontrado' });
      return;
    }
    res.json({ mensaje: 'Permiso eliminado' });
  } catch (error) {
    next(error);
  }
};
