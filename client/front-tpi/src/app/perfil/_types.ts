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

/**
 * Tabs disponibles dentro de la página de perfil.
 *
 * Para el historial de compras se usan los tipos canónicos
 * {@link import('@/lib/order-types').OrdenResumen} y
 * {@link import('@/lib/order-types').OrdenDetalle} en lugar de tipos propios
 * del perfil — la pestaña "Mis compras" consume los mismos endpoints que el
 * resto de la app.
 */
export type PerfilTab = 'datos' | 'direcciones' | 'compras' | 'seguridad';
