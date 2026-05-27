import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware genérico de validación con Zod.
 * Parsea req.body con el schema recibido; si es inválido responde 400
 * con los errores por campo. Si es válido, reemplaza req.body con los
 * datos transformados (coerción de tipos, valores por defecto, etc.).
 */
export const validar =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
      res.status(400).json({
        message: 'Datos inválidos',
        errores: resultado.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = resultado.data;
    next();
  };
