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

  /**
<<<<<<< HEAD
   * Actualiza los datos personales del usuario autenticado.
   * No permite cambiar roles, activo ni password por esta vía.
   */
  actualizarPerfil: async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { nombre, apellido, email, direccion, telefono } = req.body as {
        nombre?: string;
        apellido?: string;
        email?: string;
        direccion?: string;
        telefono?: string;
      };
      const usuario = await servicio.actualizar(req.usuario!.id, {
        nombre,
        apellido,
        email,
        direccion,
        telefono,
      });
=======
   * Actualiza el perfil propio del usuario autenticado.
   * Solo se permite modificar el teléfono — el resto de datos personales son
   * de solo lectura para usuarios comunes.
   */
  actualizarPerfil: async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { telefono } = req.body as { telefono?: string };
      // Un string vacío significa "limpiar" el teléfono almacenado
      const usuario = await servicio.actualizar(req.usuario!.id, { telefono });
>>>>>>> master
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