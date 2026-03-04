import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RequestConUsuario, JwtPayload } from '../types';

/**
 * Middleware de autenticación.
 * Verifica que el request tenga un JWT válido en el header Authorization.
 * Si es válido, adjunta el payload al objeto request para uso posterior.
 */
export const verificarToken = (req: RequestConUsuario, res: Response, next: NextFunction): void => {
  // Espera el header: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ mensaje: 'Token requerido' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.usuario = payload;
    next();
  } catch {
    res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};
