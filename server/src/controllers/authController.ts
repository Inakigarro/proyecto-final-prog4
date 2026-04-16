import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User';
import Role from '../models/Role';
import RefreshToken from '../models/RefreshToken';
import PasswordResetToken from '../models/PasswordResetToken';
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
 * Registra un nuevo usuario con el rol 'usuario' asignado por defecto.
 * Usa transacción para garantizar consistencia: si algo falla, nada se persiste.
 */
export const register = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Validación de campos requeridos
  const { nombre, apellido, email, password, fechaNacimiento } = req.body;
  if (!nombre || !apellido || !email || !password || !fechaNacimiento) {
    res.status(400).json({ mensaje: 'Todos los campos son obligatorios: nombre, apellido, email, password, fechaNacimiento' });
    return;
  }

  // Validar formato de fecha antes de intentar parsearla
  const FECHA_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!FECHA_REGEX.test(fechaNacimiento)) {
    res.status(400).json({ mensaje: 'Formato de fecha inválido. Use dd/MM/YYYY' });
    return;
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Buscar el rol por defecto que se asigna a todo usuario al registrarse
    const rolUsuario = await Role.findOne({ nombre: 'usuario' }).session(session);
    if (!rolUsuario) {
      await session.abortTransaction();
      res.status(500).json({ mensaje: 'Rol de usuario por defecto no encontrado. Ejecute el seeder.' });
      return;
    }

    // Convertir fechaNacimiento de dd/MM/YYYY a Date (formato ya validado antes de la transacción)
    const [dia, mes, anio] = fechaNacimiento.split('/').map(Number);
    const fecha = new Date(anio, mes - 1, dia);

    // create() con array + session es el modo correcto para transacciones en Mongoose
    const [usuario] = await User.create(
      [{ ...req.body, fechaNacimiento: fecha, roles: [rolUsuario._id] }],
      { session }
    );

    await session.commitTransaction();

    const { password: _, ...datos } = usuario.toObject();
    res.status(201).json(datos);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
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

    // Validación de campos requeridos
    if (!email || !password) {
      res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
      return;
    }

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
      // Filtra también por usuario para que nadie pueda revocar tokens ajenos
      await RefreshToken.deleteOne({ token: tokenRecibido, usuario: req.usuario?.id });
    }

    res.json({ mensaje: 'Sesión cerrada correctamente' });
  } catch (error) {
    next(error);
  }
};

/**
 * Genera un token de restablecimiento de contraseña para el email indicado.
 * El token se devuelve en la respuesta (sin envío de email).
 * Vence en 1 hora.
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body as { email: string };

    if (!email) {
      res.status(400).json({ mensaje: 'El email es obligatorio' });
      return;
    }

    const usuario = await User.findOne({ email, activo: true });
    // Respuesta genérica siempre para no revelar si el email existe
    if (!usuario) {
      res.json({ mensaje: 'Si el email existe, se generó un token de restablecimiento' });
      return;
    }

    // Eliminar tokens anteriores del mismo usuario
    await PasswordResetToken.deleteMany({ usuario: usuario._id });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await PasswordResetToken.create({ token, usuario: usuario._id, expiresAt });

    res.json({ mensaje: 'Token de restablecimiento generado', resetToken: token });
  } catch (error) {
    next(error);
  }
};

/**
 * Restablece la contraseña usando el token generado por forgotPassword.
 * Consume el token (lo elimina) tras usarlo.
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, nuevaPassword } = req.body as { token: string; nuevaPassword: string };

    if (!token || !nuevaPassword) {
      res.status(400).json({ mensaje: 'Token y nueva contraseña son obligatorios' });
      return;
    }

    const tokenGuardado = await PasswordResetToken.findOne({ token });
    if (!tokenGuardado) {
      res.status(400).json({ mensaje: 'Token inválido o expirado' });
      return;
    }

    const usuario = await User.findById(tokenGuardado.usuario);
    if (!usuario || !usuario.activo) {
      res.status(400).json({ mensaje: 'Token inválido o expirado' });
      return;
    }

    // Asignar nueva contraseña — el pre('save') hook se encarga del hash
    usuario.password = nuevaPassword;
    await usuario.save();

    // Consumir el token y revocar todos los refresh tokens activos del usuario
    await Promise.all([
      tokenGuardado.deleteOne(),
      RefreshToken.deleteMany({ usuario: usuario._id }),
    ]);

    res.json({ mensaje: 'Contraseña restablecida correctamente. Iniciá sesión nuevamente.' });
  } catch (error) {
    next(error);
  }
};
