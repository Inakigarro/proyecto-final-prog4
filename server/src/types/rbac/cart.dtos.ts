/**
 * DTOs del módulo de carrito.
 * El carrito vive en el frontend; el backend solo expone endpoints
 * para validar el estado actual y para confirmar la compra (checkout).
 */

import type { TipoPromocion } from '../promotion.dtos';

/**
 * Item individual que el frontend envía dentro del carrito.
 */
export interface CartItemDto {
  itemId: string;
  cantidad: number;
}

/**
 * Body del endpoint POST /api/cart/validate.
 */
export interface ValidarCarritoDto {
  items: CartItemDto[];
}

/**
 * Body del endpoint POST /api/cart/checkout.
 * `descuentos` es opcional y aplica sobre el total de la orden (porcentajes 0-100).
 */
export interface CheckoutDto {
  items: CartItemDto[];
  metodoPagoId: string;
  descuentos?: number[];
}

/**
 * Resumen de la promoción aplicada a un item validado.
 * Sirve para que el frontend pinte la cucarda y el ahorro sin tener que
 * volver a derivar la promo.
 */
export interface PromocionAplicadaResponse {
  idPromocion: string;
  nombrePromocion: string;
  tipoPromocion: TipoPromocion;
  /** Texto corto para mostrar al usuario (ej. "15% OFF", "3x2"). */
  etiqueta: string;
}

/**
 * Resultado de validar un único item del carrito.
 *
 * `subtotal` es el monto FINAL a pagar por este item (post-promoción).
 * Para reconstruir el precio sin descuento, usar `precioUnitario * cantidadSolicitada`.
 */
export interface ItemValidadoResponse {
  itemId: string;
  nombre: string;
  cantidadSolicitada: number;
  stockDisponible: number;
  /** Precio unitario base (sin descuento). */
  precioUnitario: number;
  /** Precio unitario tras aplicar DESCUENTO_PORCENTUAL. No se llena para NXM/SEGUNDA_UNIDAD. */
  precioUnitarioConDescuento?: number;
  /** Subtotal final a pagar por este item (incluye descuento si lo hay). */
  subtotal: number;
  /** subtotalSinDescuento - subtotal. 0 si no hay promoción aplicada. */
  ahorroTotal: number;
  /** Promoción usada para calcular el descuento. Indefinido si no hay. */
  promocionAplicada?: PromocionAplicadaResponse;
  disponible: boolean;
  motivo?: string;
}

/**
 * Respuesta del endpoint POST /api/cart/validate.
 *
 * `total` es el monto FINAL a pagar (suma de subtotales post-promoción).
 * `subtotalSinDescuentos` es la suma de los precios sin promoción aplicada.
 * `ahorroTotal` = `subtotalSinDescuentos - total`.
 */
export interface ValidacionCarritoResponse {
  items: ItemValidadoResponse[];
  subtotalSinDescuentos: number;
  ahorroTotal: number;
  total: number;
  carritoValido: boolean;
}

/**
 * Detalle de la orden tal como se devuelve en la respuesta del checkout.
 */
export interface DetalleOrdenResponse {
  id: string;
  itemId: string;
  nombreItem: string;
  cantidad: number;
  precioUnitario: number;
  monto: number;
}

/**
 * Respuesta del endpoint POST /api/cart/checkout.
 */
export interface CheckoutResponse {
  ordenId: string;
  usuarioId: string;
  metodoPagoId: string;
  detalles: DetalleOrdenResponse[];
  descuentos: number[];
  montoTotal: number;
  fechaCreacion: Date;
}
