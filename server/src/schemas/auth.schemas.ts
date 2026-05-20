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
