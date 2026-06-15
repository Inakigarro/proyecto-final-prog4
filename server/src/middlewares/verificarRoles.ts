import { Response, NextFunction } from 'express';
import User from '../models/User';
import { IRole } from '../models/Role';
import { RequestConUsuario } from '../types';

/**
 * Factory que devuelve un middleware que permite el acceso solo si el usuario
 * autenticado tiene al menos uno de los roles indicados.
 * Debe usarse después de verificarToken.
 */
export const verificarRoles = (...rolesRequeridos: string[]) => {
  return async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
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
      const tieneRol = roles.some((rol) => rolesRequeridos.includes(rol.nombre));

      if (!tieneRol) {
        res.status(403).json({ message: `Acceso denegado: se requiere uno de los roles: ${rolesRequeridos.join(', ')}` });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
