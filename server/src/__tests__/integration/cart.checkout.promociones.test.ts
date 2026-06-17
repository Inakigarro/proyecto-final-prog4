/**
 * Tests de integración para el checkout con promociones activas.
 * Verifica que el monto persistido en PurchaseOrderDetail incluya el
 * descuento de la mejor promoción aplicable a cada ítem.
 */
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { CartService } from '../../services/rbac/cart.service';
import User from '../../models/User';
import PaymentMethod from '../../models/paymentMethod';
import Item from '../../models/Item';
import Promotion from '../../models/Promotion';
import PurchaseOrder from '../../models/purchaseOrder';
import PurchaseOrderDetail from '../../models/purchaseOrderDetail';
import {
  conectarBdReplTest,
  desconectarBdTest,
  sembrarRoles,
} from './helpers';

jest.setTimeout(60000);

const envioFijo = {
  nombre: 'Test',
  apellido: 'Promo',
  telefono: '3442123456',
  calle: 'Av. Siempre Viva',
  numero: '742',
  ciudad: 'Concepción del Uruguay',
  provincia: 'Entre Ríos',
  codigoPostal: 'E3260',
};

const tarjetaFija = { marca: 'Visa', ultimos4: '4242' };

describe('CartService.checkout con promociones', () => {
  let replSet: MongoMemoryReplSet;
  const servicio = new CartService();

  let userId: string;
  let paymentMethodId: string;

  beforeAll(async () => {
    replSet = await conectarBdReplTest();
    const { rolUsuario } = await sembrarRoles();

    const usuario = await User.create({
      nombre: 'Test',
      apellido: 'Promo',
      email: 'promo@test.com',
      password: 'Promo@12345',
      fechaNacimiento: new Date('1990-01-01'),
      roles: [rolUsuario._id],
      activo: true,
    });
    userId = usuario._id.toString();

    const metodoPago = await PaymentMethod.create({
      nombre: 'Tarjeta',
      descripcion: 'Pago con tarjeta',
      activo: true,
    });
    paymentMethodId = metodoPago._id.toString();
  });

  afterAll(() => desconectarBdTest(replSet));

  beforeEach(async () => {
    // Limpiar entre tests; usuario y método de pago se reutilizan
    await Item.deleteMany({});
    await Promotion.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await PurchaseOrderDetail.deleteMany({});
  });

  // ──────────────────────────────────────────────
  test('DESCUENTO_PORCENTUAL 20% → monto del detalle aplica el descuento', async () => {
    const item = await Item.create({
      nombre: 'Auriculares',
      precioUnitario: 1000,
      stock: 10,
      category: [],
    });

    await Promotion.create({
      nombre: 'Auriculares 20% OFF',
      tipo: 'DESCUENTO_PORCENTUAL',
      parametros: { porcentaje: 20 },
      productos: [item._id],
      activo: true,
    });

    const respuesta = await servicio.checkout(userId, {
      items: [{ itemId: item._id.toString(), cantidad: 3 }],
      metodoPagoId: paymentMethodId,
      descuentos: [],
      envio: envioFijo,
      tarjeta: tarjetaFija,
    });

    // 1000 × 3 × 0.8 = 2400
    expect(respuesta.montoTotal).toBe(2400);
    expect(respuesta.detalles[0].monto).toBe(2400);

    const detallePersistido = await PurchaseOrderDetail.findById(respuesta.detalles[0].id);
    expect(detallePersistido?.monto).toBe(2400);
  });

  // ──────────────────────────────────────────────
  test('NXM 3x2 con cantidad 3 → cobra 2 unidades', async () => {
    const item = await Item.create({
      nombre: 'Pilas',
      precioUnitario: 500,
      stock: 20,
      category: [],
    });

    await Promotion.create({
      nombre: '3x2 en pilas',
      tipo: 'NXM',
      parametros: { cantidadLleva: 3, cantidadPaga: 2 },
      productos: [item._id],
      activo: true,
    });

    const respuesta = await servicio.checkout(userId, {
      items: [{ itemId: item._id.toString(), cantidad: 3 }],
      metodoPagoId: paymentMethodId,
      descuentos: [],
      envio: envioFijo,
      tarjeta: tarjetaFija,
    });

    // Cobra solo 2 unidades: 500 × 2 = 1000
    expect(respuesta.montoTotal).toBe(1000);
    expect(respuesta.detalles[0].monto).toBe(1000);
  });

  // ──────────────────────────────────────────────
  test('cuando hay varias promociones aplicables, elige la mejor', async () => {
    const item = await Item.create({
      nombre: 'Producto múltiple',
      precioUnitario: 100,
      stock: 50,
      category: [],
    });

    // Dos promos activas sobre el mismo producto: 10% y 3x2 (~33%)
    await Promotion.create({
      nombre: '10% OFF',
      tipo: 'DESCUENTO_PORCENTUAL',
      parametros: { porcentaje: 10 },
      productos: [item._id],
      activo: true,
    });
    await Promotion.create({
      nombre: '3x2',
      tipo: 'NXM',
      parametros: { cantidadLleva: 3, cantidadPaga: 2 },
      productos: [item._id],
      activo: true,
    });

    const respuesta = await servicio.checkout(userId, {
      items: [{ itemId: item._id.toString(), cantidad: 3 }],
      metodoPagoId: paymentMethodId,
      descuentos: [],
      envio: envioFijo,
      tarjeta: tarjetaFija,
    });

    // Gana 3x2: cobra 2 unidades = 200 (mejor que 270 del 10%)
    expect(respuesta.montoTotal).toBe(200);
  });

  // ──────────────────────────────────────────────
  test('promoción inactiva → no se aplica', async () => {
    const item = await Item.create({
      nombre: 'Producto sin promo activa',
      precioUnitario: 100,
      stock: 10,
      category: [],
    });

    await Promotion.create({
      nombre: 'Promo dormida',
      tipo: 'DESCUENTO_PORCENTUAL',
      parametros: { porcentaje: 50 },
      productos: [item._id],
      activo: false,
    });

    const respuesta = await servicio.checkout(userId, {
      items: [{ itemId: item._id.toString(), cantidad: 2 }],
      metodoPagoId: paymentMethodId,
      descuentos: [],
      envio: envioFijo,
      tarjeta: tarjetaFija,
    });

    // Sin descuento: 100 × 2 = 200
    expect(respuesta.montoTotal).toBe(200);
  });
});
