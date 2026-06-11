/**
 * Tests de integración para CartService.checkout.
 * Usa MongoMemoryReplSet porque checkout utiliza transacciones MongoDB.
 */
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { CartService } from '../../services/rbac/cart.service';
import User from '../../models/User';
import PaymentMethod from '../../models/paymentMethod';
import Item from '../../models/Item';
import PurchaseOrder from '../../models/purchaseOrder';
import {
  conectarBdReplTest,
  desconectarBdTest,
  limpiarColecciones,
  sembrarRoles,
} from './helpers';

jest.setTimeout(60000);

describe('CartService.checkout', () => {
  let replSet: MongoMemoryReplSet;
  const servicio = new CartService();

  let userId: string;
  let paymentMethodId: string;

  beforeAll(async () => {
    replSet = await conectarBdReplTest();

    // Semilla fija: rol + usuario + método de pago
    const { rolUsuario: rol } = await sembrarRoles();

    const usuario = await User.create({
      nombre: 'Test',
      apellido: 'Checkout',
      email: 'checkout@test.com',
      password: 'Checkout@1234',
      fechaNacimiento: new Date('1990-01-01'),
      roles: [rol._id],
      activo: true,
    });
    userId = usuario._id.toString();

    const metodoPago = await PaymentMethod.create({
      nombre: 'Transferencia Bancaria',
      descripcion: 'Transferencia a cuenta bancaria',
      activo: true,
    });
    paymentMethodId = metodoPago._id.toString();
  });

  afterAll(() => desconectarBdTest(replSet));

  beforeEach(async () => {
    // Solo limpiar items y órdenes entre tests; usuario y método de pago se reutilizan
    await Item.deleteMany({});
    await PurchaseOrder.deleteMany({});
  });

  // ──────────────────────────────────────────────
  test('stock insuficiente → lanza error y no crea ninguna orden (rollback)', async () => {
    const item = await Item.create({
      nombre: 'Laptop Test',
      precioUnitario: 1500,
      stock: 2,         // solo 2 unidades disponibles
      category: [],
    });

    await expect(
      servicio.checkout(userId, {
        items: [{ itemId: item._id.toString(), cantidad: 5 }], // pide 5
        metodoPagoId: paymentMethodId,
        descuentos: [],
      })
    ).rejects.toThrow('Stock insuficiente');

    // La transacción abortó: stock sin cambios
    const itemActualizado = await Item.findById(item._id);
    expect(itemActualizado?.stock).toBe(2);

    // No se creó ninguna orden
    const cantOrdenes = await PurchaseOrder.countDocuments();
    expect(cantOrdenes).toBe(0);
  });

  // ──────────────────────────────────────────────
  test('checkout exitoso → crea la orden y descuenta stock', async () => {
    const item = await Item.create({
      nombre: 'Monitor Test',
      precioUnitario: 300,
      stock: 10,
      category: [],
    });

    const respuesta = await servicio.checkout(userId, {
      items: [{ itemId: item._id.toString(), cantidad: 2 }],
      metodoPagoId: paymentMethodId,
      descuentos: [],
    });

    expect(respuesta.ordenId).toBeDefined();
    expect(respuesta.montoTotal).toBe(600); // 300 * 2

    // Stock decrementado
    const itemActualizado = await Item.findById(item._id);
    expect(itemActualizado?.stock).toBe(8); // 10 - 2

    // Orden persistida
    const cantOrdenes = await PurchaseOrder.countDocuments();
    expect(cantOrdenes).toBe(1);
  });
});
