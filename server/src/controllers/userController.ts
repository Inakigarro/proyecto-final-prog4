import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { UsuarioInput, UsuarioUpdateInput, RequestConUsuario } from '../types';

/** Devuelve el perfil del usuario autenticado (extraído del JWT) */
export const perfil = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuario = await User.findById(req.usuario!.id).populate({ path: 'roles', populate: { path: 'permisos' } });
    if (!usuario) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

/** Devuelve todos los usuarios con sus roles populados */
export const listar = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuarios = await User.find().populate({ path: 'roles', populate: { path: 'permisos' } });
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

/** Devuelve un usuario por ID con roles y permisos populados */
export const obtener = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuario = await User.findById(req.params.id).populate({ path: 'roles', populate: { path: 'permisos' } });
    if (!usuario) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

/** Crea un nuevo usuario */
export const crear = async (req: Request<{}, {}, UsuarioInput>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuario = await User.create(req.body);
    // No devolver la contraseña en la respuesta
    const { password: _, ...datos } = usuario.toObject();
    res.status(201).json(datos);
  } catch (error) {
    next(error);
  }
};

/** Actualiza un usuario por ID */
export const actualizar = async (req: Request<{ id: string }, {}, UsuarioUpdateInput>, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Si se envía password, usar save() para que dispare el pre-hook de hasheo
    if (req.body.password) {
      const usuario = await User.findById(req.params.id).select('+password');
      if (!usuario) {
        res.status(404).json({ mensaje: 'Usuario no encontrado' });
        return;
      }
      Object.assign(usuario, req.body);
      await usuario.save();
      const { password: _, ...datos } = usuario.toObject();
      res.json(datos);
      return;
    }

    const usuario = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate({ path: 'roles', populate: { path: 'permisos' } });

    if (!usuario) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

/** Elimina un usuario por ID */
export const eliminar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuario = await User.findByIdAndDelete(req.params.id);
    if (!usuario) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    next(error);
  }
};
