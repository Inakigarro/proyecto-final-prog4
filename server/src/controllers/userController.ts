import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/rbac/user.service';
import { CrearUsuarioDto, ActualizarUsuarioDto, RequestConUsuario } from '../types';

const servicio = new UserService();

/**
 * Controlador para manejar las peticiones HTTP del recurso Usuarios.
 * Delega la lógica de negocio al UserService.
 */

/** Devuelve el perfil del usuario autenticado extraído del JWT */
export const perfil = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuario = await servicio.obtenerPerfil(req.usuario!.id);
    if (!usuario) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

/** Devuelve todos los usuarios con sus roles y permisos populados */
export const listar = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuarios = await servicio.obtenerTodos();
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

/** Devuelve un usuario por ID con roles y permisos populados */
export const obtener = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuario = await servicio.obtenerPorId(req.params.id);
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
export const crear = async (req: Request<{}, {}, CrearUsuarioDto>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuario = await servicio.crear(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
};

/** Actualiza un usuario por ID */
export const actualizar = async (req: Request<{ id: string }, {}, ActualizarUsuarioDto>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuario = await servicio.actualizar(req.params.id, req.body);
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
    const eliminado = await servicio.eliminar(req.params.id);
    if (!eliminado) {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
      return;
    }
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    next(error);
  }
};