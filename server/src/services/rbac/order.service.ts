import PurchaseOrder from '../../models/purchaseOrder';
import { IItem } from '../../models/Item';
import { IPurchaseOrderDetail } from '../../models/purchaseOrderDetail';
import { IUser } from '../../models/User';
import { IOrderService } from '../../types/rbac/order.service.interface';
import { OrdenResumenDto, OrdenDetalleDto, DetalleOrdenDto } from '../../types/rbac/order.dtos';

/** Populate profundo: detalles con item, metodoPago, usuario. */
const POPULATE_ORDEN = [
  { path: 'detalles', populate: { path: 'item' } },
  { path: 'metodoPago' },
  { path: 'usuario', select: 'nombre apellido email' },
];

/** Tipo auxiliar para los detalles populados. */
type DetallePopulado = IPurchaseOrderDetail & { item: IItem };

/**
 * Implementación del servicio de órdenes de compra.
 */
export class OrderService implements IOrderService {

  /** Obtiene las órdenes de un usuario (resumen, ordenadas por fecha desc). */
  async obtenerPorUsuario(usuarioId: string): Promise<OrdenResumenDto[]> {
    const ordenes = await PurchaseOrder.find({ usuario: usuarioId })
      .populate('detalles')
      .sort({ createdAt: -1 })
      .lean();

    return ordenes.map((orden) => ({
      id: orden._id.toString(),
      fechaCreacion: orden.createdAt,
      montoTotal: orden.montoTotal,
      cantidadItems: orden.detalles.length,
      envio: {
        nombre: orden.envio.nombre,
        apellido: orden.envio.apellido,
      },
      tarjeta: {
        marca: orden.tarjeta.marca,
        ultimos4: orden.tarjeta.ultimos4,
      },
    }));
  }

  /** Obtiene el detalle de una orden, verificando que pertenezca al usuario. */
  async obtenerDetallePorUsuario(ordenId: string, usuarioId: string): Promise<OrdenDetalleDto | null> {
    const orden = await PurchaseOrder.findOne({ _id: ordenId, usuario: usuarioId })
      .populate(POPULATE_ORDEN)
      .lean();

    if (!orden) return null;

    return this.mapearDetalle(orden);
  }

  /** Obtiene todas las órdenes del sistema (admin). */
  async obtenerTodas(): Promise<OrdenResumenDto[]> {
    const ordenes = await PurchaseOrder.find()
      .populate('detalles')
      .populate('usuario', 'nombre apellido email')
      .sort({ createdAt: -1 })
      .lean();

    return ordenes.map((orden) => ({
      id: orden._id.toString(),
      fechaCreacion: orden.createdAt,
      montoTotal: orden.montoTotal,
      cantidadItems: orden.detalles.length,
      envio: {
        nombre: orden.envio.nombre,
        apellido: orden.envio.apellido,
      },
      tarjeta: {
        marca: orden.tarjeta.marca,
        ultimos4: orden.tarjeta.ultimos4,
      },
    }));
  }

  /** Obtiene el detalle de cualquier orden (admin). */
  async obtenerDetalle(ordenId: string): Promise<OrdenDetalleDto | null> {
    const orden = await PurchaseOrder.findById(ordenId)
      .populate(POPULATE_ORDEN)
      .lean();

    if (!orden) return null;

    return this.mapearDetalle(orden);
  }

  /** Mapea un documento de orden populado a su DTO de detalle. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapearDetalle(orden: any): OrdenDetalleDto {
    const detalles: DetalleOrdenDto[] = (orden.detalles as DetallePopulado[]).map((d) => ({
      id: d._id.toString(),
      itemId: d.item._id.toString(),
      nombreItem: d.item.nombre,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
      monto: d.monto,
    }));

    const usuario = orden.usuario as IUser;
    const metodoPago = orden.metodoPago as { _id: { toString(): string }; nombre: string };
    
    return {
      id: orden._id.toString(),
      fechaCreacion: orden.createdAt,
      montoTotal: orden.montoTotal,
      descuentos: orden.descuentos,
      detalles,
      envio: {
        nombre: orden.envio.nombre,
        apellido: orden.envio.apellido,
        telefono: orden.envio.telefono,
        calle: orden.envio.calle,
        numero: orden.envio.numero,
        piso: orden.envio.piso,
        departamento: orden.envio.departamento,
        ciudad: orden.envio.ciudad,
        provincia: orden.envio.provincia,
        codigoPostal: orden.envio.codigoPostal,
      },
      tarjeta: {
        marca: orden.tarjeta.marca,
        ultimos4: orden.tarjeta.ultimos4,
      },
      metodoPago: {
        id: metodoPago._id.toString(),
        nombre: metodoPago.nombre,
      },
      usuario: {
        id: usuario._id.toString(),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
      },
    };
  }
}