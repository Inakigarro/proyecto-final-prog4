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
 * Datos de envío enviados en el checkout.
 *
 * El campo `direccionId` es opcional: si está presente y pertenece al usuario,
 * el backend reutiliza esa Address (no crea ni dedupea) y los demás campos
 * funcionan solo como snapshot dentro de la PurchaseOrder. Si no se envía,
 * el backend hace upsert: busca una Address activa con los mismos datos para
 * el usuario y, si no existe, crea una nueva.
 */
export interface DatosEnvioDto {
  /** Nombre de quien recibe el pedido (puede diferir del titular). */
  nombre: string;
  /** Apellido de quien recibe el pedido. */
  apellido: string;
  /** Teléfono de contacto: 10 dígitos (código de área + número, sin 0 ni 15). */
  telefono: string;

  /** Calle de la dirección de envío. */
  calle: string;
  /** Número de puerta. */
  numero: string;
  /** Piso del edificio (opcional). */
  piso?: string;
  /** Departamento dentro del piso (opcional). */
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

/**
 * Datos de la tarjeta enviados en el checkout.
 * Solo se persisten la marca y los últimos 4 dígitos (nunca el número completo).
 */
export interface DatosTarjetaDto {
  /** Marca detectada por BIN (Visa, Mastercard, etc.) */
  marca: string;
  /** Últimos 4 dígitos del número de tarjeta */
  ultimos4: string;
}

/**
 * Body del endpoint POST /api/cart/checkout.
 * `descuentos` es opcional y aplica sobre el total de la orden (porcentajes 0-100).
 */
export interface CheckoutDto {
  items: CartItemDto[];
  metodoPagoId: string;
  descuentos?: number[];
  envio: DatosEnvioDto;
  tarjeta: DatosTarjetaDto;
  /**
   * Si true, el teléfono se persiste también en el perfil del usuario.
   * La dirección siempre se guarda como Address (con dedupe).
   */
  guardarDatosEnPerfil?: boolean;
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
 * Snapshot de envío incluido en la respuesta del checkout.
 * No incluye `direccionId` porque el cliente ya sabe qué eligió; este es el
 * snapshot histórico de los datos exactos que viajaron con la orden.
 */
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
  envio: EnvioOrdenResponse;
  tarjeta: DatosTarjetaDto;
}
