import { z } from 'zod';

/**
 * Validación Zod para el alta y actualización de slides del home.
 * `imagen` puede ser una URL http(s) común o un data URI base64 (los uploads
 * desde el dashboard llegan como data URI). No usamos z.url() porque
 * rechazaría los data URIs.
 */
export const CrearSlideSchema = z.object({
  imagen: z
    .string({ error: 'La imagen es obligatoria' })
    .min(1, 'La imagen es obligatoria')
    .max(10_000_000, 'La imagen excede el tamaño máximo permitido'),
  alt: z
    .string({ error: 'El texto alternativo es obligatorio' })
    .trim()
    .min(2, 'El texto alternativo debe tener al menos 2 caracteres')
    .max(120, 'El texto alternativo no puede superar los 120 caracteres'),
  leyenda: z
    .string({ error: 'La leyenda es obligatoria' })
    .trim()
    .min(2, 'La leyenda debe tener al menos 2 caracteres')
    .max(200, 'La leyenda no puede superar los 200 caracteres'),
  orden: z
    .number({ error: 'El orden debe ser un número' })
    .int('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo'),
});

/** Para PUT: todos los campos son opcionales; los que llegan deben pasar la misma validación. */
export const ActualizarSlideSchema = CrearSlideSchema.partial();
