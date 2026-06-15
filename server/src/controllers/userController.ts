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
   * Actualiza el perfil propio del usuario autenticado.
   * Permite modificar nombre, apellido, fecha de nacimiento y teléfono.
   * El email queda fijo: se usa como identificador de login y solo el superadmin
   * lo puede cambiar.
   */
  actualizarPerfil: async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { nombre, apellido, fechaNacimiento, telefono } = req.body as {
        nombre?: string;
        apellido?: string;
        fechaNacimiento?: string;
        telefono?: string;
      };

      // Armamos el DTO solo con los campos enviados para no pisar valores existentes
      const cambios: ActualizarUsuarioDto = {};
      if (nombre !== undefined) cambios.nombre = nombre;
      if (apellido !== undefined) cambios.apellido = apellido;
      if (telefono !== undefined) cambios.telefono = telefono;
      if (fechaNacimiento !== undefined) {
        // Parseo manual para evitar shifts por timezone de new Date("yyyy-MM-dd")
        const [anio, mes, dia] = fechaNacimiento.split('-').map(Number);
        cambios.fechaNacimiento = new Date(anio, mes - 1, dia);
      }

      const usuario = await servicio.actualizar(req.usuario!.id, cambios);
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
