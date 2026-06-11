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
});
