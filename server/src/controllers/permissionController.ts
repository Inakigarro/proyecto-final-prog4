import { Request, Response, NextFunction } from 'express';
import Permission from '../models/Permission';
import { PermisoInput } from '../types';

/** Devuelve todos los permisos */
export const listar = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const permisos = await Permission.find();
    res.json(permisos);
  } catch (error) {
    next(error);
  }
};

/** Devuelve un permiso por ID */
export const obtener = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const permiso = await Permission.findById(req.params.id);
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
export const crear = async (req: Request<{}, {}, PermisoInput>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const permiso = await Permission.create(req.body);
    res.status(201).json(permiso);
  } catch (error) {
    next(error);
  }
};

/** Actualiza un permiso por ID */
export const actualizar = async (req: Request<{ id: string }, {}, Partial<PermisoInput>>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const permiso = await Permission.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
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
    const permiso = await Permission.findByIdAndDelete(req.params.id);
    if (!permiso) {
      res.status(404).json({ mensaje: 'Permiso no encontrado' });
      return;
    }
    res.json({ mensaje: 'Permiso eliminado' });
  } catch (error) {
    next(error);
  }
};
