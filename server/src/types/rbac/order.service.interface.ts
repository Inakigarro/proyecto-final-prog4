import { OrdenResumenDto, OrdenDetalleDto } from './order.dtos';

/**
 * Contrato del servicio de órdenes de compra.
 */
export interface IOrderService {
  /** Obtiene todas las órdenes de un usuario (resumen). */
  obtenerPorUsuario(usuarioId: string): Promise<OrdenResumenDto[]>;

  /** Obtiene el detalle de una orden, verificando que pertenezca al usuario. */
  obtenerDetallePorUsuario(ordenId: string, usuarioId: string): Promise<OrdenDetalleDto | null>;

  /** Obtiene todas las órdenes del sistema (admin). */
  obtenerTodas(): Promise<OrdenResumenDto[]>;

  /** Obtiene el detalle de cualquier orden (admin). */
  obtenerDetalle(ordenId: string): Promise<OrdenDetalleDto | null>;
}