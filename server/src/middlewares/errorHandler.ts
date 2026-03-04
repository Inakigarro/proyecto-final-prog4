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

  // Error genérico
  console.error(error);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
};
