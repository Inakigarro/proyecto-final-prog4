import { Types } from 'mongoose';
import Item, { IItem } from '../../models/Item';
import PaymentMethod from '../../models/paymentMethod';
import PurchaseOrder, { IPurchaseOrder } from '../../models/purchaseOrder';
import PurchaseOrderDetail, {
  IPurchaseOrderDetail,
} from '../../models/purchaseOrderDetail';
import User from '../../models/User';
import {
  CartItemDto,
  CheckoutDto,
  CheckoutResponse,
  DetalleOrdenResponse,
  ItemValidadoResponse,
  ValidacionCarritoResponse,
  ValidarCarritoDto,
} from '../../types/rbac/cart.dtos';
import { ICartService } from '../../types/rbac/cart.service.interface';

/**
 * Calcula el monto total aplicando descuentos acumulativos en porcentaje.
 * Misma lógica que la del modelo PurchaseOrder, replicada para usar
 * antes de persistir la orden.
 */
function calcularMontoTotal(montoBase: number, descuentos: number[]): number {
  const factorDescuento = descuentos.reduce(
    (acc, descuento) => acc * (1 - descuento / 100),
    1
  );
  return parseFloat((montoBase * factorDescuento).toFixed(2));
}

/**
 * Valida que un id sea un ObjectId de Mongo bien formado.
 * Lanza un Error con mensaje claro si no lo es.
 */
function validarObjectId(id: string, nombreCampo: string): void {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error(`El ${nombreCampo} no es un ObjectId válido: ${id}`);
  }
}

/**
 * Valida que el array de descuentos contenga solo números entre 0 y 100.
 */
function validarDescuentos(descuentos: number[]): void {
  for (const d of descuentos) {
    if (typeof d !== 'number' || d < 0 || d > 100) {
      throw new Error(
        `Cada descuento debe ser un número entre 0 y 100. Valor inválido: ${d}`
      );
    }
  }
}

/**
 * Mapea un PurchaseOrderDetail (con item populado) a su DTO de respuesta.
 */
function mapearDetalleAResponseDto(
  detalle: IPurchaseOrderDetail
): DetalleOrdenResponse {
  const item = detalle.item as unknown as IItem;
  return {
    id: detalle._id.toString(),
    itemId: item._id.toString(),
    nombreItem: item.nombre,
    cantidad: detalle.cantidad,
    precioUnitario: detalle.precioUnitario,
    monto: detalle.monto,
  };
}

/**
 * Servicio de carrito.
 * El carrito es híbrido: los items se manejan en el frontend y este
 * servicio expone operaciones para validar el estado contra la BD
 * y para confirmar la compra creando la orden correspondiente.
 */
export class CartService implements ICartService {
  constructor() {}

  /**
   * Valida los items del carrito contra la base.
   * No persiste nada: solo lee precios y stock actuales y arma la respuesta.
   */
  async validateCart(
    dto: ValidarCarritoDto
  ): Promise<ValidacionCarritoResponse> {
    if (!dto.items || dto.items.length === 0) {
      throw new Error('El carrito no puede estar vacío');
    }

    // Validamos formato de cada item antes de ir a la BD
    for (const it of dto.items) {
      validarObjectId(it.itemId, 'itemId');
      if (!Number.isInteger(it.cantidad) || it.cantidad < 1) {
        throw new Error(
          `La cantidad debe ser un entero mayor o igual a 1 (item ${it.itemId})`
        );
      }
    }

    // Traemos todos los items en una sola query para evitar N+1
    const ids = dto.items.map((i) => i.itemId);
    const itemsEnBd = await Item.find({ _id: { $in: ids } });
    const itemsPorId = new Map<string, IItem>(
      itemsEnBd.map((it) => [it._id.toString(), it])
    );

    const itemsValidados: ItemValidadoResponse[] = dto.items.map((pedido) => {
      const itemBd = itemsPorId.get(pedido.itemId);

      if (!itemBd) {
        return {
          itemId: pedido.itemId,
          nombre: '(no encontrado)',
          cantidadSolicitada: pedido.cantidad,
          stockDisponible: 0,
          precioUnitario: 0,
          subtotal: 0,
          disponible: false,
          motivo: 'Item inexistente',
        };
      }

      const subtotal = parseFloat(
        (itemBd.precioUnitario * pedido.cantidad).toFixed(2)
      );
      const hayStock = itemBd.stock >= pedido.cantidad;

      return {
        itemId: itemBd._id.toString(),
        nombre: itemBd.nombre,
        cantidadSolicitada: pedido.cantidad,
        stockDisponible: itemBd.stock,
        precioUnitario: itemBd.precioUnitario,
        subtotal,
        disponible: hayStock,
        motivo: hayStock ? undefined : 'Stock insuficiente',
      };
    });

    const total = parseFloat(
      itemsValidados.reduce((acc, it) => acc + it.subtotal, 0).toFixed(2)
    );
    const carritoValido = itemsValidados.every((it) => it.disponible);

    return { items: itemsValidados, total, carritoValido };
  }

  /**
   * Confirma la compra.
   * Pasos:
   *  1. Valida formato del DTO y existencia de usuario y método de pago.
   *  2. Por cada item, descuenta stock atómicamente con findOneAndUpdate + $inc
   *     filtrando por stock >= cantidad. Si el update no encuentra documento,
   *     el stock era insuficiente y se cancela el checkout (rollback manual).
   *  3. Crea los PurchaseOrderDetail (su monto se autocalcula en pre-save).
   *  4. Crea la PurchaseOrder con el montoTotal calculado.
   */
  async checkout(usuarioId: string, dto: CheckoutDto): Promise<CheckoutResponse> {
    // 1) Validaciones iniciales del DTO
    validarObjectId(usuarioId, 'usuarioId');
    validarObjectId(dto.metodoPagoId, 'metodoPagoId');

    if (!dto.items || dto.items.length === 0) {
      throw new Error('El carrito no puede estar vacío');
    }
    for (const it of dto.items) {
      validarObjectId(it.itemId, 'itemId');
      if (!Number.isInteger(it.cantidad) || it.cantidad < 1) {
        throw new Error(
          `La cantidad debe ser un entero mayor o igual a 1 (item ${it.itemId})`
        );
      }
    }

    const descuentos = dto.descuentos ?? [];
    validarDescuentos(descuentos);

    // 2) Verificamos usuario activo
    const usuario = await User.findById(usuarioId);
    if (!usuario) {
      throw new Error('El usuario no existe');
    }
    if (!usuario.activo) {
      throw new Error('El usuario está inactivo y no puede realizar compras');
    }

    // 3) Verificamos método de pago activo
    const metodoPago = await PaymentMethod.findById(dto.metodoPagoId);
    if (!metodoPago) {
      throw new Error('El método de pago no existe');
    }
    if (!metodoPago.activo) {
      throw new Error('El método de pago está inactivo');
    }

    // 4) Descontamos stock atómicamente y guardamos qué descontamos para
    //    poder revertir si algo falla más adelante.
    const stockDescontado: { itemId: string; cantidad: number }[] = [];

    try {
      for (const pedido of dto.items) {
        const itemActualizado = await Item.findOneAndUpdate(
          { _id: pedido.itemId, stock: { $gte: pedido.cantidad } },
          { $inc: { stock: -pedido.cantidad } },
          { new: true }
        );

        if (!itemActualizado) {
          // O el item no existe o el stock es insuficiente. Diferenciamos
          // para devolver un mensaje útil.
          const existe = await Item.exists({ _id: pedido.itemId });
          if (!existe) {
            throw new Error(`El item ${pedido.itemId} no existe`);
          }
          throw new Error(
            `Stock insuficiente para el item ${pedido.itemId}`
          );
        }

        stockDescontado.push({
          itemId: pedido.itemId,
          cantidad: pedido.cantidad,
        });
      }

      // 5) Creamos los detalles. El pre-save del modelo calcula `monto`.
      //    Releemos el precio actual del item para snapshotearlo en el detalle.
      const detalles: IPurchaseOrderDetail[] = [];
      for (const pedido of dto.items) {
        const item = await Item.findById(pedido.itemId);
        if (!item) {
          // Caso defensivo: ya descontamos su stock arriba, pero por algún
          // motivo desapareció. Tratamos como error y rollback se encarga.
          throw new Error(
            `El item ${pedido.itemId} desapareció durante el checkout`
          );
        }

        const detalle = await PurchaseOrderDetail.create({
          item: item._id,
          cantidad: pedido.cantidad,
          precioUnitario: item.precioUnitario,
          descuentos: [],
        });
        detalles.push(detalle);
      }

      // 6) Calculamos el montoBase sumando los detalles ya guardados
      const montoBase = detalles.reduce((acc, d) => acc + d.monto, 0);
      const montoTotal = calcularMontoTotal(montoBase, descuentos);

      // 7) Creamos la orden
      const orden: IPurchaseOrder = await PurchaseOrder.create({
        usuario: usuario._id,
        detalles: detalles.map((d) => d._id),
        metodoPago: metodoPago._id,
        descuentos,
        montoTotal,
      });

      // 8) Populamos los items en los detalles para armar la response
      const detallesPopulados = await PurchaseOrderDetail.find({
        _id: { $in: detalles.map((d) => d._id) },
      }).populate('item');

      return {
        ordenId: orden._id.toString(),
        usuarioId: usuario._id.toString(),
        metodoPagoId: metodoPago._id.toString(),
        detalles: detallesPopulados.map(mapearDetalleAResponseDto),
        descuentos: orden.descuentos,
        montoTotal: orden.montoTotal,
        fechaCreacion: (orden as IPurchaseOrder & { createdAt: Date })
          .createdAt,
      };
    } catch (error) {
      // Rollback manual del stock descontado. Si esto falla a su vez, lo
      // logueamos pero priorizamos rethrow del error original.
      await Promise.all(
        stockDescontado.map((s) =>
          Item.findByIdAndUpdate(s.itemId, { $inc: { stock: s.cantidad } })
        )
      ).catch((rollbackError) => {
        // eslint-disable-next-line no-console
        console.error(
          'Error revirtiendo stock durante rollback de checkout:',
          rollbackError
        );
      });

      throw error;
    }
  }
}