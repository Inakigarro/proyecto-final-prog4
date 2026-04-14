import { Request, Response, NextFunction } from 'express';

/**
 * Middleware global de manejo de errores.
 * Captura errores de Mongoose (duplicados, validación) y errores genéricos.
 * Debe registrarse al final de todos los middlewares en index.ts.
 */
export const errorHandler = (error: any, _req: Request, res: Response, _next: NextFunction): void => {
  // Error de clave duplicada en MongoDB (ej: email o nombre ya existe)
  if (error.code === 11000) {
    const campo = Object.keys(error.keyValue)[0];
    res.status(409).json({ mensaje: `El valor del campo '${campo}' ya está en uso` });
    return;
  }

  // Error de validación de Mongoose
  if (error.name === 'ValidationError') {
    const mensajes = Object.values(error.errors).map((e: any) => e.message);
    res.status(400).json({ mensaje: 'Error de validación', errores: mensajes });
    return;
  }

  // ObjectId inválido (ej: /api/users/id-que-no-es-objectid)
  if (error.name === 'CastError') {
    res.status(400).json({ mensaje: `ID inválido: ${error.value}` });
    return;
  }

  // Token JWT malformado (llega aquí si se propaga más allá del middleware auth)
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({ mensaje: 'Token inválido' });
    return;
  }

  // Token JWT expirado
  if (error.name === 'TokenExpiredError') {
    res.status(401).json({ mensaje: 'Token expirado' });
    return;
  }

  // Error genérico
  console.error(error);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
};
