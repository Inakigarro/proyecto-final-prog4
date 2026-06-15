/**
 * Tipos compartidos entre los componentes y hooks de la sección de perfil.
 * Reflejan los DTOs que devuelven los endpoints del backend.
 */

/** Dirección postal del usuario tal como la devuelve GET /api/addresses/me */
export interface Direccion {
  id: string;
  calle: string;
  numero: string;
  piso?: string;
  departamento?: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
}

/** Línea resumida de una orden de compra para el historial */
export interface CompraResumen {
  id: string;
  /** Fecha de la compra como string ISO */
  fecha: string;
  /** Monto total ya con descuentos aplicados */
  montoTotal: number;
  /** Estado de la orden (pendiente, confirmada, entregada, cancelada, etc.) */
  estado: string;
  /** Cantidad total de items comprados (suma de cantidades) */
  cantidadItems: number;
}

/** Tabs disponibles dentro de la página de perfil */
export type PerfilTab = 'datos' | 'direcciones' | 'compras' | 'seguridad';
