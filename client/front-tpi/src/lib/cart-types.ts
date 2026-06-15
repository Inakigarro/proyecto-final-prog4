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

/**
 * Datos de envío para el checkout.
 *
 * Si `direccionId` está definido y pertenece al usuario autenticado, el
 * backend reutiliza esa Address. Si no, los campos de dirección se usan
 * para crear (o dedupear) una Address nueva contra las activas del usuario.
 */
export interface DatosEnvioDto {
  /** Quien recibe el pedido (puede diferir del titular). */
  nombre: string;
  apellido: string;
  /** 10 dígitos: código de área + número */
  telefono: string;

  /** Calle de la dirección. */
  calle: string;
  /** Número de puerta. */
  numero: string;
  /** Piso del edificio (opcional). */
  piso?: string;
  /** Departamento (opcional). */
  departamento?: string;
  /** Ciudad o localidad. */
  ciudad: string;
  /** Provincia. */
  provincia: string;
  /** Código postal. */
  codigoPostal: string;

  /** Id de una dirección ya guardada del usuario; si viene, el backend la reusa. */
  direccionId?: string;
}

/** Snapshot de envío incluido en la respuesta de POST /api/cart/checkout. */
export interface EnvioOrdenResponse {
  nombre: string;
  apellido: string;
  telefono: string;
  calle: string;
  numero: string;
  piso?: string;
  departamento?: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
}

/** Datos de la tarjeta para el checkout (solo marca + últimos 4). */
export interface DatosTarjetaDto {
  /** Marca detectada por BIN (Visa, Mastercard, etc.) */
  marca: string;
  /** Últimos 4 dígitos del número de tarjeta */
  ultimos4: string;
}

/** Body de POST /api/cart/checkout. */
export interface CheckoutDto {
  items: CartItemDto[];
  metodoPagoId: string;
  /** Porcentajes 0-100, opcional. */
  descuentos?: number[];
  envio: DatosEnvioDto;
  tarjeta: DatosTarjetaDto;
  /** Si true, guarda dirección y teléfono en el perfil del usuario. Default: true. */
  guardarDatosEnPerfil?: boolean;
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

/** Método de pago devuelto por GET /api/cart/payment-methods. */
export interface MetodoPagoResponse {
  id: string;
  nombre: string;
  descripcion: string;
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
  envio: EnvioOrdenResponse;
  tarjeta: DatosTarjetaDto;
}