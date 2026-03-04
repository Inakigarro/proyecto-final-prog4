import { Request, Response, NextFunction } from 'express';
import Role from '../models/Role';
import { RolInput } from '../types';

/** Devuelve todos los roles con sus permisos populados */
export const listar = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roles = await Role.find().populate('permisos');
    res.json(roles);
  } catch (error) {
    next(error);
  }
};

/** Devuelve un rol por ID con sus permisos populados */
export const obtener = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rol = await Role.findById(req.params.id).populate('permisos');
    if (!rol) {
      res.status(404).json({ mensaje: 'Rol no encontrado' });
      return;
    }
    res.json(rol);
  } catch (error) {
    next(error);
  }
};

/** Crea un nuevo rol */
export const crear = async (req: Request<{}, {}, RolInput>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rol = await Role.create(req.body);
    res.status(201).json(rol);
  } catch (error) {
    next(error);
  }
};

/** Actualiza un rol por ID */
export const actualizar = async (req: Request<{ id: string }, {}, Partial<RolInput>>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rol = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('permisos');
    if (!rol) {
      res.status(404).json({ mensaje: 'Rol no encontrado' });
      return;
    }
    res.json(rol);
  } catch (error) {
    next(error);
  }
};

/** Elimina un rol por ID */
export const eliminar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rol = await Role.findByIdAndDelete(req.params.id);
    if (!rol) {
      res.status(404).json({ mensaje: 'Rol no encontrado' });
      return;
    }
    res.json({ mensaje: 'Rol eliminado' });
  } catch (error) {
    next(error);
  }
};
