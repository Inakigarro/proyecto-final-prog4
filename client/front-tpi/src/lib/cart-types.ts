import type { TipoPromocion } from "./promociones";

export interface CartItem {
  itemId: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
}

/** Item individual que el frontend envía dentro del carrito. */
export interface CartItemDto {
  itemId: string;
  cantidad: number;
}

/** Body de POST /api/cart/validate. */
export interface ValidarCarritoDto {
  items: CartItemDto[];
}

/** Body de POST /api/cart/checkout. */
export interface CheckoutDto {
  items: CartItemDto[];
  metodoPagoId: string;
  /** Porcentajes 0-100, opcional. */
  descuentos?: number[];
}

/** Resumen de la promoción aplicada a un item validado por el backend. */
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
 * `subtotal` es el monto FINAL a pagar por este item (con promo aplicada).
 * Para mostrar el subtotal SIN descuento, calcular `precioUnitario * cantidadSolicitada`.
 */
export interface ItemValidadoResponse {
  itemId: string;
  nombre: string;
  cantidadSolicitada: number;
  stockDisponible: number;
  /** Precio unitario base sin descuento. */
  precioUnitario: number;
  /** Precio unitario tras aplicar DESCUENTO_PORCENTUAL. No se llena para NXM/SEGUNDA_UNIDAD. */
  precioUnitarioConDescuento?: number;
  /** Subtotal final con descuento aplicado. */
  subtotal: number;
  /** subtotalSinDescuento - subtotal. 0 si no hay promo. */
  ahorroTotal: number;
  /** Promoción usada para el cálculo. */
  promocionAplicada?: PromocionAplicadaResponse;
  disponible: boolean;
  motivo?: string;
}

/**
 * Respuesta de POST /api/cart/validate.
 *
 * `total` es el monto FINAL a pagar (con promociones aplicadas).
 * `subtotalSinDescuentos` es la suma sin promos.
 * `ahorroTotal` es `subtotalSinDescuentos - total`.
 */
export interface ValidacionCarritoResponse {
  items: ItemValidadoResponse[];
  subtotalSinDescuentos: number;
  ahorroTotal: number;
  total: number;
  carritoValido: boolean;
}

/** Detalle de la orden devuelto por checkout. */
export interface DetalleOrdenResponse {
  id: string;
  itemId: string;
  nombreItem: string;
  cantidad: number;
  precioUnitario: number;
  monto: number;
}

/** Respuesta de POST /api/cart/checkout. */
export interface CheckoutResponse {
  ordenId: string;
  usuarioId: string;
  metodoPagoId: string;
  detalles: DetalleOrdenResponse[];
  descuentos: number[];
  montoTotal: number;
  fechaCreacion: string;
}
