import { Response, NextFunction } from 'express';
import User from '../models/User';
import Role from '../models/Role';
import { RequestConUsuario } from '../types';

/**
 * Middleware que verifica que el usuario autenticado tenga el rol superadmin.
 * Debe usarse después de verificarToken.
 */
export const verificarSuperAdmin = async (
  req: RequestConUsuario,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = await User.findById(req.usuario?.id).populate('roles');

    if (!usuario) {
      res.status(401).json({ mensaje: 'Usuario no encontrado' });
      return;
    }

    const esSuperAdmin = (usuario.roles as any[]).some(
      (rol) => rol.nombre === 'superadmin'
    );

    if (!esSuperAdmin) {
      res.status(403).json({ mensaje: 'Acceso denegado: se requiere rol superadmin' });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};