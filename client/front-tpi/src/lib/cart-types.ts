
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

/** Resultado de validar un único item del carrito. */
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

/** Respuesta de POST /api/cart/validate. */
export interface ValidacionCarritoResponse {
  items: ItemValidadoResponse[];
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