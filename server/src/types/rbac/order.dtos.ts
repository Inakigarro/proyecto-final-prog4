/**
 * DTOs del módulo de órdenes de compra.
 */

/** Detalle de un item dentro de una orden. */
export interface DetalleOrdenDto {
  id: string;
  itemId: string;
  nombreItem: string;
  cantidad: number;
  precioUnitario: number;
  monto: number;
}

/** Resumen de una orden para listados. */
export interface OrdenResumenDto {
  id: string;
  fechaCreacion: Date;
  montoTotal: number;
  cantidadItems: number;
  envio: {
    nombre: string;
    apellido: string;
  };
  tarjeta: {
    marca: string;
    ultimos4: string;
  };
}

/** Snapshot de envío como quedó persistido en la orden. */
export interface OrdenEnvioDto {
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

/** Detalle completo de una orden. */
export interface OrdenDetalleDto {
  id: string;
  fechaCreacion: Date;
  montoTotal: number;
  descuentos: number[];
  detalles: DetalleOrdenDto[];
  envio: OrdenEnvioDto;
  tarjeta: {
    marca: string;
    ultimos4: string;
  };
  metodoPago: {
    id: string;
    nombre: string;
  };
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
}