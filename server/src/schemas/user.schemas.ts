import { z } from 'zod';
import { TELEFONO_AR_REGEX } from '../models/User';

/**
 * Schema para actualizar el perfil propio (PUT /api/users/me).
 *
 * Actualmente solo se permite editar el teléfono. Los datos personales
 * (nombre, apellido, email, fecha de nacimiento) son de solo lectura desde
 * el perfil del usuario común; cualquier cambio se hace por superadmin.
 *
 * Se permite enviar string vacío para limpiar el teléfono.
 */
export const ActualizarPerfilSchema = z.object({
  telefono: z
    .string()
    .trim()
    .refine((valor) => valor === '' || TELEFONO_AR_REGEX.test(valor), {
      message: 'El teléfono debe tener formato argentino, p.ej. +54 9 11 1234 5678',
    })
    .optional(),
});

export type ActualizarPerfilInput = z.infer<typeof ActualizarPerfilSchema>;
