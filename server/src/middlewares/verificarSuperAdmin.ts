import { Response, NextFunction } from 'express';
import User from '../models/User';
import { IRole } from '../models/Role';
import { RequestConUsuario } from '../types';
import { ROL_SUPERADMIN } from '../config/constants';

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
      res.status(401).json({ message: 'Usuario no encontrado' });
      return;
    }

    if (!usuario.activo) {
      res.status(403).json({ message: 'Acceso denegado: cuenta desactivada' });
      return;
    }

    const roles = usuario.roles as unknown as IRole[];
    const esSuperAdmin = roles.some(rol => rol.nombre === ROL_SUPERADMIN);

    if (!esSuperAdmin) {
      res.status(403).json({ message: 'Acceso denegado: se requiere rol superadmin' });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
