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

/** Detalle completo de una orden. */
export interface OrdenDetalle {
  id: string;
  fechaCreacion: string;
  montoTotal: number;
  descuentos: number[];
  detalles: DetalleOrden[];
  envio: {
    nombre: string;
    apellido: string;
    direccion: string;
    telefono: string;
  };
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