import { z } from 'zod';

/**
 * Validación Zod para el alta y actualización de slides del home.
 * `imagen` se valida como URL para que solo entren rutas servibles por el browser.
 */
export const CrearSlideSchema = z.object({
  imagen: z
    .string({ error: 'La URL de la imagen es obligatoria' })
    .url('La imagen debe ser una URL válida')
    .max(500, 'La URL no puede superar los 500 caracteres'),
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
