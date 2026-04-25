/**
 * DTOs del módulo de carrito.
 * El carrito vive en el frontend; el backend solo expone endpoints
 * para validar el estado actual y para confirmar la compra (checkout).
 */

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
 * Resultado de validar un único item del carrito.
 */
export interface ItemValidadoResponse {
  itemId: string;
  nombre: string;
  cantidadSolicitada: number;
  stockDisponible: number;
  precioUnitario: number;
  subtotal: number;
  disponible: boolean;
  motivo?: string;
}

/**
 * Respuesta del endpoint POST /api/cart/validate.
 * `total` es la suma de subtotales sin aplicar descuentos.
 */
export interface ValidacionCarritoResponse {
  items: ItemValidadoResponse[];
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