import { z } from 'zod';
import { Types } from 'mongoose';

/** Valida que el string sea un ObjectId de Mongoose válido */
const objectIdSchema = z
  .string()
  .refine((id) => Types.ObjectId.isValid(id), { message: 'ObjectId inválido' });

/** Un item individual del carrito: referencia al producto y cantidad */
export const CartItemSchema = z.object({
  itemId: objectIdSchema,
  cantidad: z
    .number({ error: 'La cantidad debe ser un número' })
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad mínima es 1'),
});

/** Body del endpoint POST /api/cart/validate */
export const ValidarCarritoSchema = z.object({
  items: z.array(CartItemSchema).min(1, 'El carrito debe tener al menos un item'),
});

/** Datos de envío del checkout */
const DatosEnvioSchema = z.object({
  nombre: z
    .string({ error: 'El nombre es obligatorio' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z
    .string({ error: 'El apellido es obligatorio' })
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  telefono: z
    .string({ error: 'El teléfono es obligatorio' })
    .regex(/^\d{10}$/, 'El teléfono debe tener exactamente 10 dígitos numéricos'),
  calle: z
    .string({ error: 'La calle es obligatoria' })
    .trim()
    .min(2, 'La calle debe tener al menos 2 caracteres')
    .max(100, 'La calle no puede superar los 100 caracteres'),
  numero: z
    .string({ error: 'El número es obligatorio' })
    .trim()
    .min(1, 'El número es obligatorio')
    .max(10, 'El número no puede superar los 10 caracteres'),
  piso: z.string().trim().max(10, 'El piso no puede superar los 10 caracteres').optional(),
  departamento: z
    .string()
    .trim()
    .max(10, 'El departamento no puede superar los 10 caracteres')
    .optional(),
  ciudad: z
    .string({ error: 'La ciudad es obligatoria' })
    .trim()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(80, 'La ciudad no puede superar los 80 caracteres'),
  provincia: z
    .string({ error: 'La provincia es obligatoria' })
    .trim()
    .min(2, 'La provincia debe tener al menos 2 caracteres')
    .max(80, 'La provincia no puede superar los 80 caracteres'),
  codigoPostal: z
    .string({ error: 'El código postal es obligatorio' })
    .trim()
    .min(2, 'El código postal es obligatorio')
    .max(10, 'El código postal no puede superar los 10 caracteres'),
  direccionId: objectIdSchema.optional(),
});

/** Datos de la tarjeta del checkout (solo marca + últimos 4) */
const DatosTarjetaSchema = z.object({
  marca: z
    .string({ error: 'La marca de la tarjeta es obligatoria' })
    .trim()
    .min(1, 'La marca de la tarjeta es obligatoria'),
  ultimos4: z
    .string({ error: 'Los últimos 4 dígitos son obligatorios' })
    .regex(/^\d{4}$/, 'Deben ser exactamente 4 dígitos'),
});

/** Body del endpoint POST /api/cart/checkout */
export const CheckoutSchema = z.object({
  items: z.array(CartItemSchema).min(1, 'El carrito debe tener al menos un item'),
  metodoPagoId: objectIdSchema,
  descuentos: z
    .array(
      z
        .number({ error: 'El descuento debe ser un número' })
        .min(0, 'El descuento mínimo es 0')
        .max(100, 'El descuento máximo es 100')
    )
    .optional()
    .default([]),
  envio: DatosEnvioSchema,
  tarjeta: DatosTarjetaSchema,
  guardarDatosEnPerfil: z.boolean().optional().default(true),
});