import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User, { validarComplejidadPassword } from '../models/User';
import Role from '../models/Role';
import RefreshToken from '../models/RefreshToken';
import PasswordResetToken from '../models/PasswordResetToken';
import PasswordChangeChallenge from '../models/PasswordChangeChallenge';
import { LoginInput, RegisterInput, AuthResponse, JwtPayload, RequestConUsuario } from '../types';
import {
  enviarEmailResetPassword,
  enviarEmailCodigoCambioPassword,
  enviarEmailBienvenida,
  enviarEmailCambioPasswordExitoso,
} from '../services/email/emailService';
import { logger } from '../config/logger';
import { IUser } from '../models/User';
import { IRefreshToken } from '../models/RefreshToken';

/** Cantidad máxima de intentos antes de invalidar el challenge */
const MAX_INTENTOS_CODIGO = 3;
/** Vida útil del código de verificación (5 minutos) */
const VIDA_CODIGO_MS = 5 * 60 * 1000;

type RefreshTokenPopulado = Omit<IRefreshToken, 'usuario'> & { usuario: IUser };

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
  const { nombre, apellido, email, password, fechaNacimiento } = req.body;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const rolUsuario = await Role.findOne({ nombre: 'usuario' }).session(session);
    if (!rolUsuario) {
      await session.abortTransaction();
      res.status(500).json({ message: 'Rol de usuario por defecto no encontrado. Ejecute el seeder.' });
      return;
    }

    const [dia, mes, anio] = fechaNacimiento.split('/').map(Number);
    const fecha = new Date(anio, mes - 1, dia);

    const [usuario] = await User.create(
      [{ ...req.body, fechaNacimiento: fecha, roles: [rolUsuario._id] }],
      { session }
    );

    await session.commitTransaction();

    // Email de bienvenida best-effort: si Resend/SMTP falla no rompemos el alta
    enviarEmailBienvenida(usuario.email, usuario.nombre).catch((error) => {
      logger.error('No se pudo enviar el email de bienvenida', { email: usuario.email, error: String(error) });
    });

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

    const usuario = await User.findOne({ email, activo: true }).select('+password');
    if (!usuario) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      res.status(401).json({ message: 'Credenciales inválidas' });
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

    const tokenGuardado = await RefreshToken.findOne({ token: tokenRecibido }).populate('usuario');
    if (!tokenGuardado) {
      res.status(401).json({ message: 'Refresh token inválido o expirado' });
      return;
    }

    const { usuario } = tokenGuardado as unknown as RefreshTokenPopulado;

    if (!usuario.activo) {
      await tokenGuardado.deleteOne();
      res.status(401).json({ message: 'Usuario inactivo' });
      return;
    }

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
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken: tokenRecibido } = req.body as { refreshToken: string };

    await RefreshToken.deleteOne({ token: tokenRecibido });

    res.json({ message: 'Sesión cerrada correctamente' });
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

    const usuario = await User.findOne({ email, activo: true });
    // Respuesta genérica siempre para no revelar si el email existe
    if (!usuario) {
      res.json({ message: 'Si el email existe, se generó un token de restablecimiento' });
      return;
    }

    await PasswordResetToken.deleteMany({ usuario: usuario._id });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await PasswordResetToken.create({ token, usuario: usuario._id, expiresAt });

    await enviarEmailResetPassword(email, token);

    res.json({ message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña.' });
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

    const tokenGuardado = await PasswordResetToken.findOne({ token });
    if (!tokenGuardado) {
      res.status(400).json({ message: 'Token inválido o expirado' });
      return;
    }

    const usuario = await User.findById(tokenGuardado.usuario);
    if (!usuario || !usuario.activo) {
      res.status(400).json({ message: 'Token inválido o expirado' });
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

    res.json({ message: 'Contraseña restablecida correctamente. Iniciá sesión nuevamente.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Inicia el cambio de contraseña desde el perfil del usuario autenticado.
 *
 * Valida la contraseña actual, hashea la nueva, genera un código de 6 dígitos,
 * crea (o reemplaza) el challenge en BD con 5 minutos de TTL y manda el
 * código por email vía Resend.
 *
 * Por seguridad nunca diferenciamos "password actual incorrecta" de cualquier
 * otro error de validación de complejidad — devolvemos 400 con un mensaje
 * genérico cuando la actual no matchea.
 */
export const solicitarCambioPassword = async (
  req: RequestConUsuario,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { passwordActual, nuevaPassword } = req.body as {
      passwordActual: string;
      nuevaPassword: string;
    };

    const usuario = await User.findById(req.usuario!.id).select('+password');
    if (!usuario || !usuario.activo) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }

    const actualValida = await usuario.compararPassword(passwordActual);
    if (!actualValida) {
      res.status(400).json({ message: 'La contraseña actual es incorrecta' });
      return;
    }

    // Defensa adicional al validador Zod por si alguien evita el middleware
    if (!validarComplejidadPassword(nuevaPassword)) {
      res.status(400).json({ message: 'La nueva contraseña no cumple los requisitos de complejidad' });
      return;
    }

    if (nuevaPassword === passwordActual) {
      res.status(400).json({ message: 'La nueva contraseña no puede ser igual a la actual' });
      return;
    }

    // Código de 6 dígitos crypto-safe; relleno con ceros si quedó corto
    const codigo = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
    const [codigoHash, nuevaPasswordHash] = await Promise.all([
      bcrypt.hash(codigo, 10),
      bcrypt.hash(nuevaPassword, 10),
    ]);

    // Invalida challenges previos para que solo el más reciente sea válido
    await PasswordChangeChallenge.deleteMany({ usuario: usuario._id });
    await PasswordChangeChallenge.create({
      usuario: usuario._id,
      codigoHash,
      nuevaPasswordHash,
      expiresAt: new Date(Date.now() + VIDA_CODIGO_MS),
    });

    await enviarEmailCodigoCambioPassword(usuario.email, codigo);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Confirma el cambio de contraseña con el código recibido por email.
 *
 * Tras validar el código aplica `nuevaPasswordHash` directamente sobre el
 * usuario con updateOne (sin pasar por save) para evitar que el pre-hook
 * vuelva a hashear el hash. Revoca todos los refresh tokens previos y emite
 * un par nuevo así la pestaña actual del usuario sigue funcionando.
 */
export const confirmarCambioPassword = async (
  req: RequestConUsuario,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { codigo } = req.body as { codigo: string };

    const challenge = await PasswordChangeChallenge.findOne({ usuario: req.usuario!.id });
    if (!challenge) {
      res.status(400).json({ message: 'No hay un cambio de contraseña pendiente. Iniciá el proceso nuevamente.' });
      return;
    }

    if (challenge.expiresAt.getTime() < Date.now()) {
      await challenge.deleteOne();
      res.status(400).json({ message: 'El código expiró. Iniciá el proceso nuevamente.' });
      return;
    }

    const codigoValido = await bcrypt.compare(codigo, challenge.codigoHash);
    if (!codigoValido) {
      challenge.intentos += 1;
      // Tras MAX_INTENTOS_CODIGO fallidos invalidamos el challenge para forzar a reiniciar
      if (challenge.intentos >= MAX_INTENTOS_CODIGO) {
        await challenge.deleteOne();
        res.status(400).json({ message: 'Demasiados intentos fallidos. Iniciá el proceso nuevamente.' });
        return;
      }
      await challenge.save();
      const restantes = MAX_INTENTOS_CODIGO - challenge.intentos;
      res.status(400).json({ message: `Código inválido. Te quedan ${restantes} intento(s).` });
      return;
    }

    // Aplicamos el hash directamente para evitar el pre('save') que re-hashearía.
    // Devolvemos el documento para tener nombre y email actualizado para el aviso.
    const usuarioActualizado = await User.findOneAndUpdate(
      { _id: req.usuario!.id },
      { password: challenge.nuevaPasswordHash },
      { new: true },
    );

    // Revocamos todos los refresh tokens previos y consumimos el challenge
    await Promise.all([
      RefreshToken.deleteMany({ usuario: req.usuario!.id }),
      challenge.deleteOne(),
    ]);

    // Aviso best-effort: si el envío falla no rompemos la respuesta al usuario
    if (usuarioActualizado) {
      enviarEmailCambioPasswordExitoso(usuarioActualizado.email, usuarioActualizado.nombre).catch((error) => {
        logger.error('No se pudo enviar el aviso de cambio de password', {
          email: usuarioActualizado.email,
          error: String(error),
        });
      });
    }

    // Emitimos un par nuevo para no desloguear la pestaña actual
    const payload: JwtPayload = { id: req.usuario!.id, email: req.usuario!.email };
    const accessToken = generarAccessToken(payload);
    const refreshToken = await generarRefreshToken(req.usuario!.id);

    const respuesta: AuthResponse = { accessToken, refreshToken };
    res.json(respuesta);
  } catch (error) {
    next(error);
  }
};
