import { z } from 'zod';
import { TELEFONO_AR_REGEX } from '../models/User';

/**
 * Schema para actualizar el perfil propio (PUT /api/users/me).
 *
 * El usuario común puede editar todos sus datos personales excepto el email,
 * que se usa como identificador de login y queda como solo lectura.
 *
 * Todos los campos son opcionales: el cliente puede mandar solo los que cambió.
 * Se permite enviar string vacío para limpiar el teléfono.
 */
export const ActualizarPerfilSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede superar los 50 caracteres')
    .optional(),
  apellido: z
    .string()
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede superar los 50 caracteres')
    .optional(),
  // Fecha en formato ISO (yyyy-MM-dd) — es lo que devuelve <input type="date">
  fechaNacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido. Use yyyy-MM-dd')
    .optional(),
  telefono: z
    .string()
    .trim()
    .refine((valor) => valor === '' || TELEFONO_AR_REGEX.test(valor), {
      message: 'El teléfono debe tener formato argentino, p.ej. +54 9 11 1234 5678',
    })
    .optional(),
});

export type ActualizarPerfilInput = z.infer<typeof ActualizarPerfilSchema>;
