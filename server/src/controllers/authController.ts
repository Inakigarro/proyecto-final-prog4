import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import RefreshToken from '../models/RefreshToken';
import { LoginInput, RegisterInput, AuthResponse, JwtPayload, RequestConUsuario } from '../types';

/** Genera un access token JWT de corta duración (15 minutos) */
const generarAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '15m',
  });
};

/** Genera un refresh token opaco aleatorio y lo guarda en la BD */
const generarRefreshToken = async (usuarioId: string): Promise<string> => {
  const token = crypto.randomBytes(64).toString('hex');
  const expiracion = new Date();
  expiracion.setDate(expiracion.getDate() + 30); // vence en 30 días

  await RefreshToken.create({ token, usuario: usuarioId, expiresAt: expiracion });
  return token;
};

/**
 * Registra un nuevo usuario sin roles.
 * Los roles se asignan por separado desde el CRUD de usuarios.
 */
export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usuario = await User.create(req.body);
    const { password: _, ...datos } = usuario.toObject();
    res.status(201).json(datos);
  } catch (error) {
    next(error);
  }
};

/** Autentica al usuario y devuelve access token + refresh token */
export const login = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Recuperar explícitamente la contraseña (está con select: false en el modelo)
    const usuario = await User.findOne({ email, activo: true }).select('+password');
    if (!usuario) {
      res.status(401).json({ mensaje: 'Credenciales inválidas' });
      return;
    }

    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      res.status(401).json({ mensaje: 'Credenciales inválidas' });
      return;
    }

    const payload: JwtPayload = { id: usuario.id, email: usuario.email };
    const accessToken = generarAccessToken(payload);
    const refreshToken = await generarRefreshToken(usuario.id);

    const respuesta: AuthResponse = { accessToken, refreshToken };
    res.json(respuesta);
  } catch (error) {
    next(error);
  }
};

/**
 * Emite un nuevo access token usando un refresh token válido.
 * El refresh token se rota: se elimina el anterior y se genera uno nuevo.
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: tokenRecibido } = req.body as { refreshToken: string };

    if (!tokenRecibido) {
      res.status(400).json({ mensaje: 'Refresh token requerido' });
      return;
    }

    const tokenGuardado = await RefreshToken.findOne({ token: tokenRecibido }).populate('usuario');
    if (!tokenGuardado) {
      res.status(401).json({ mensaje: 'Refresh token inválido o expirado' });
      return;
    }

    const usuario = tokenGuardado.usuario as any;

    // Rotar: eliminar el token anterior y emitir uno nuevo
    await tokenGuardado.deleteOne();
    const nuevoRefreshToken = await generarRefreshToken(usuario._id.toString());

    const payload: JwtPayload = { id: usuario._id.toString(), email: usuario.email };
    const nuevoAccessToken = generarAccessToken(payload);

    const respuesta: AuthResponse = { accessToken: nuevoAccessToken, refreshToken: nuevoRefreshToken };
    res.json(respuesta);
  } catch (error) {
    next(error);
  }
};

/** Revoca el refresh token del usuario (cierre de sesión) */
export const logout = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: tokenRecibido } = req.body as { refreshToken: string };

    if (tokenRecibido) {
      await RefreshToken.deleteOne({ token: tokenRecibido });
    }

    res.json({ mensaje: 'Sesión cerrada correctamente' });
  } catch (error) {
    next(error);
  }
};
