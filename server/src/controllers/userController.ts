import { Request, Response, NextFunction } from 'express';
import { IUserService } from '../types/rbac/user.service.interface';
import { CrearUsuarioDto, ActualizarUsuarioDto, RequestConUsuario } from '../types';

/**
 * Factory del controller de usuarios.
 * Recibe el servicio como dependencia para facilitar el testeo unitario.
 */
export const crearUserController = (servicio: IUserService) => ({

  /** Devuelve el perfil del usuario autenticado extraído del JWT */
  perfil: async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuario = await servicio.obtenerPerfil(req.usuario!.id);
      if (!usuario) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  },

  /** Devuelve todos los usuarios con sus roles y permisos populados */
  listar: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarios = await servicio.obtenerTodos();
      res.json(usuarios);
    } catch (error) {
      next(error);
    }
  },

  /** Devuelve un usuario por ID con roles y permisos populados */
  obtener: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuario = await servicio.obtenerPorId(req.params.id);
      if (!usuario) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  },

  /** Crea un nuevo usuario */
  crear: async (
    req: Request<{}, {}, CrearUsuarioDto>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuario = await servicio.crear(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  },

  /** Actualiza un usuario por ID */
  actualizar: async (
    req: Request<{ id: string }, {}, ActualizarUsuarioDto>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usuario = await servicio.actualizar(req.params.id, req.body);
      if (!usuario) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  },

  /** Actualiza los datos personales del usuario autenticado (no permite cambiar roles ni activo) */
  actualizarPerfil: async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { nombre, apellido, email } = req.body as { nombre?: string; apellido?: string; email?: string };
      const usuario = await servicio.actualizar(req.usuario!.id, { nombre, apellido, email });
      if (!usuario) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  },

  /** Desactiva un usuario por ID (borrado lógico) */
  eliminar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eliminado = await servicio.eliminar(req.params.id);
      if (!eliminado) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
});
