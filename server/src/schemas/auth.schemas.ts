import { z } from 'zod';
import { validarComplejidadPassword } from '../models/User';

/**
 * Schema de contraseña reutilizable: mínimo 8 caracteres, mayúscula,
 * minúscula, número y símbolo especial (igual que el validator del modelo User).
 */
const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .refine(validarComplejidadPassword, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo especial',
  });

export const RegisterSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede superar los 50 caracteres'),
  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede superar los 50 caracteres'),
  email: z.string().email('Email inválido'),
  password: passwordSchema,
  fechaNacimiento: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato de fecha inválido. Use dd/MM/YYYY'),
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es obligatorio'),
  nuevaPassword: passwordSchema,
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'El refresh token es obligatorio'),
});

/**
 * Solicita el cambio de contraseña: requiere la actual y la nueva.
 * El backend valida que la actual matchee y dispara el envío del código por mail.
 */
export const CambiarPasswordRequestSchema = z.object({
  passwordActual: z.string().min(1, 'La contraseña actual es obligatoria'),
  nuevaPassword: passwordSchema,
});

/**
 * Confirma el cambio con el código de 6 dígitos recibido por email.
 * Aplica la nueva contraseña que se guardó hasheada en el challenge.
 */
export const CambiarPasswordConfirmSchema = z.object({
  codigo: z
    .string()
    .regex(/^\d{6}$/, 'El código debe ser de 6 dígitos numéricos'),
});
