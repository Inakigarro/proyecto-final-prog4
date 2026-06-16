/** Resumen de una orden para listados. */
export interface OrdenResumen {
  id: string;
  fechaCreacion: string;
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

/** Detalle de un item en una orden. */
export interface DetalleOrden {
  id: string;
  itemId: string;
  nombreItem: string;
  cantidad: number;
  precioUnitario: number;
  monto: number;
}

/** Snapshot de envío como quedó persistido en la orden. */
export interface OrdenEnvio {
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
export interface OrdenDetalle {
  id: string;
  fechaCreacion: string;
  montoTotal: number;
  descuentos: number[];
  detalles: DetalleOrden[];
  envio: OrdenEnvio;
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