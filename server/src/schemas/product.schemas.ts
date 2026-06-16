import { z } from 'zod';
import { Types } from 'mongoose';

/**
 * Valida que el string sea un ObjectId válido y lo convierte a Types.ObjectId,
 * manteniendo compatibilidad con el tipo CrearItemDto.category.
 */
const objectIdSchema = z
  .string()
  .refine((id) => Types.ObjectId.isValid(id), { message: 'ObjectId inválido' })
  .transform((id) => new Types.ObjectId(id));

export const CrearItemSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  descripcion: z
    .string()
    .max(500, 'La descripción no puede superar los 500 caracteres')
    .optional(),
  imagen: z
    .string()
    .url('La imagen debe ser una URL válida')
    .max(500, 'La URL de la imagen no puede superar los 500 caracteres')
    .optional(),
  precioUnitario: z
    .number({ error: 'El precio debe ser un número' })
    .positive('El precio unitario debe ser mayor a 0'),
  stock: z
    .number({ error: 'El stock debe ser un número' })
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .optional(),
  category: z
    .array(objectIdSchema)
    .min(1, 'Debe especificar al menos una categoría'),
});

/** Para PUT: todos los campos son opcionales; los que llegan deben seguir las mismas reglas */
export const ActualizarItemSchema = CrearItemSchema.partial();
