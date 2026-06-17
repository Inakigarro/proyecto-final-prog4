/**
 * Tests de integración para los endpoints de órdenes.
 * Cubre las cuatro rutas: /me, /me/:id, / y /:id, incluyendo
 * los chequeos de autorización (usuario propio vs. admin).
 *
 * Las órdenes se insertan directamente con los modelos para aislar
 * el test del flujo de checkout (ya cubierto en cart.checkout.test.ts).
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { Types } from 'mongoose';
import { crearApp } from '../../app';
import User from '../../models/User';
import Item from '../../models/Item';
import PaymentMethod from '../../models/paymentMethod';
import PurchaseOrder from '../../models/purchaseOrder';
import PurchaseOrderDetail from '../../models/purchaseOrderDetail';
import {
  conectarBdTest,
  desconectarBdTest,
  generarToken,
  sembrarRoles,
} from './helpers';

jest.setTimeout(60000);

const app = crearApp();

const datosEnvio = {
  nombre: 'Test',
  apellido: 'Buyer',
  telefono: '3442123456',
  calle: 'Av. Falsa',
  numero: '123',
  ciudad: 'Concepción del Uruguay',
  provincia: 'Entre Ríos',
  codigoPostal: 'E3260',
};

const datosTarjeta = { marca: 'Visa', ultimos4: '4242' };

/**
 * Crea una orden persistida directamente en la BD.
 * Salta el flujo de checkout para mantener el test enfocado en el OrderService.
 */
async function crearOrden(opciones: {
  usuarioId: string;
  itemId: Types.ObjectId;
  precioUnitario: number;
  cantidad: number;
  metodoPagoId: string;
}) {
  const detalle = await PurchaseOrderDetail.create({
    item: opciones.itemId,
    cantidad: opciones.cantidad,
    precioUnitario: opciones.precioUnitario,
    descuentos: [],
  });

  return PurchaseOrder.create({
    usuario: opciones.usuarioId,
    detalles: [detalle._id],
    metodoPago: opciones.metodoPagoId,
    descuentos: [],
    montoTotal: detalle.monto,
    envio: datosEnvio,
    tarjeta: datosTarjeta,
  });
}

describe('Orders endpoints', () => {
  let server: MongoMemoryServer;

  let tokenUsuarioA: string;
  let tokenUsuarioB: string;
  let tokenSuperAdmin: string;
  let usuarioAId: string;
  let usuarioBId: string;
  let metodoPagoId: string;
  let itemId: Types.ObjectId;

  beforeAll(async () => {
    server = await conectarBdTest();
    const { rolUsuario, rolSuperAdmin } = await sembrarRoles();

    const usuarioA = await User.create({
      nombre: 'Usuario',
      apellido: 'Uno',
      email: 'usuario.a@test.com',
      password: 'UsuarioA@1',
      fechaNacimiento: new Date('1990-01-01'),
      roles: [rolUsuario._id],
      activo: true,
    });
    usuarioAId = usuarioA._id.toString();
    tokenUsuarioA = generarToken(usuarioAId, usuarioA.email);

    const usuarioB = await User.create({
      nombre: 'Usuario',
      apellido: 'Dos',
      email: 'usuario.b@test.com',
      password: 'UsuarioB@1',
      fechaNacimiento: new Date('1992-01-01'),
      roles: [rolUsuario._id],
      activo: true,
    });
    usuarioBId = usuarioB._id.toString();
    tokenUsuarioB = generarToken(usuarioBId, usuarioB.email);

    const superAdmin = await User.create({
      nombre: 'Super',
      apellido: 'Admin',
      email: 'super@test.com',
      password: 'Super@12345',
      fechaNacimiento: new Date('1985-01-01'),
      roles: [rolSuperAdmin._id],
      activo: true,
    });
    tokenSuperAdmin = generarToken(superAdmin._id.toString(), superAdmin.email);

    const metodoPago = await PaymentMethod.create({
      nombre: 'Efectivo',
      descripcion: 'Pago en efectivo',
      activo: true,
    });
    metodoPagoId = metodoPago._id.toString();

    const item = await Item.create({
      nombre: 'Item de prueba',
      precioUnitario: 200,
      stock: 100,
      category: [],
    });
    itemId = item._id;
  });

  afterAll(() => desconectarBdTest(server));

  beforeEach(async () => {
    // Solo limpiar órdenes entre tests; usuarios e item se reutilizan
    await PurchaseOrder.deleteMany({});
    await PurchaseOrderDetail.deleteMany({});
  });

  // ──────────────────────────────────────────────
  // GET /api/orders/me
  // ──────────────────────────────────────────────
  describe('GET /api/orders/me', () => {
    test('sin token → 401', async () => {
      const res = await request(app).get('/api/orders/me');
      expect(res.status).toBe(401);
    });

    test('usuario sin órdenes → array vacío', async () => {
      const res = await request(app)
        .get('/api/orders/me')
        .set('Authorization', `Bearer ${tokenUsuarioA}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('devuelve solo las órdenes del usuario autenticado', async () => {
      await crearOrden({ usuarioId: usuarioAId, itemId, precioUnitario: 200, cantidad: 1, metodoPagoId });
      await crearOrden({ usuarioId: usuarioAId, itemId, precioUnitario: 200, cantidad: 2, metodoPagoId });
      await crearOrden({ usuarioId: usuarioBId, itemId, precioUnitario: 200, cantidad: 5, metodoPagoId });

      const res = await request(app)
        .get('/api/orders/me')
        .set('Authorization', `Bearer ${tokenUsuarioA}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      // Cada resumen tiene los campos esperados
      expect(res.body[0]).toMatchObject({
        montoTotal: expect.any(Number),
        cantidadItems: 1,
        envio: { nombre: 'Test', apellido: 'Buyer' },
        tarjeta: { marca: 'Visa', ultimos4: '4242' },
      });
    });
  });

  // ──────────────────────────────────────────────
  // GET /api/orders/me/:id
  // ──────────────────────────────────────────────
  describe('GET /api/orders/me/:id', () => {
    test('orden propia → 200 con detalle', async () => {
      const orden = await crearOrden({
        usuarioId: usuarioAId, itemId, precioUnitario: 200, cantidad: 3, metodoPagoId,
      });

      const res = await request(app)
        .get(`/api/orders/me/${orden._id.toString()}`)
        .set('Authorization', `Bearer ${tokenUsuarioA}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(orden._id.toString());
      expect(res.body.detalles).toHaveLength(1);
      expect(res.body.detalles[0]).toMatchObject({
        nombreItem: 'Item de prueba',
        cantidad: 3,
        precioUnitario: 200,
        monto: 600,
      });
      expect(res.body.envio).toMatchObject({ ciudad: 'Concepción del Uruguay' });
    });

    test('orden de otro usuario → 404', async () => {
      const ordenDeB = await crearOrden({
        usuarioId: usuarioBId, itemId, precioUnitario: 200, cantidad: 1, metodoPagoId,
      });

      const res = await request(app)
        .get(`/api/orders/me/${ordenDeB._id.toString()}`)
        .set('Authorization', `Bearer ${tokenUsuarioA}`);

      expect(res.status).toBe(404);
    });

    test('orden inexistente → 404', async () => {
      const idFake = new Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/orders/me/${idFake}`)
        .set('Authorization', `Bearer ${tokenUsuarioA}`);

      expect(res.status).toBe(404);
    });
  });

  // ──────────────────────────────────────────────
  // GET /api/orders  (admin)
  // ──────────────────────────────────────────────
  describe('GET /api/orders', () => {
    test('usuario común → 403', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tokenUsuarioA}`);

      expect(res.status).toBe(403);
    });

    test('superadmin ve todas las órdenes del sistema', async () => {
      await crearOrden({ usuarioId: usuarioAId, itemId, precioUnitario: 200, cantidad: 1, metodoPagoId });
      await crearOrden({ usuarioId: usuarioBId, itemId, precioUnitario: 200, cantidad: 4, metodoPagoId });

      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tokenSuperAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  // ──────────────────────────────────────────────
  // GET /api/orders/:id  (admin)
  // ──────────────────────────────────────────────
  describe('GET /api/orders/:id', () => {
    test('superadmin puede ver el detalle de la orden de otro usuario', async () => {
      const orden = await crearOrden({
        usuarioId: usuarioBId, itemId, precioUnitario: 200, cantidad: 2, metodoPagoId,
      });

      const res = await request(app)
        .get(`/api/orders/${orden._id.toString()}`)
        .set('Authorization', `Bearer ${tokenSuperAdmin}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(orden._id.toString());
      expect(res.body.usuario).toMatchObject({ email: 'usuario.b@test.com' });
    });

    test('usuario común → 403 aun siendo dueño de la orden', async () => {
      const orden = await crearOrden({
        usuarioId: usuarioAId, itemId, precioUnitario: 200, cantidad: 1, metodoPagoId,
      });

      const res = await request(app)
        .get(`/api/orders/${orden._id.toString()}`)
        .set('Authorization', `Bearer ${tokenUsuarioB}`);

      expect(res.status).toBe(403);
    });

    test('orden inexistente → 404 para admin', async () => {
      const idFake = new Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/orders/${idFake}`)
        .set('Authorization', `Bearer ${tokenSuperAdmin}`);

      expect(res.status).toBe(404);
    });
  });
});
