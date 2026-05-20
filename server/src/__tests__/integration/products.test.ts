/**
 * Tests de integración para los endpoints de productos.
 * Cubre: GET paginado, filtro por q, POST con distintos niveles de autorización.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { crearApp } from '../../app';
import User from '../../models/User';
import Category from '../../models/Category';
import Item from '../../models/Item';
import {
  conectarBdTest,
  desconectarBdTest,
  limpiarColecciones,
  generarToken,
  sembrarRoles,
} from './helpers';

jest.setTimeout(60000);

const app = crearApp();

describe('Products endpoints', () => {
  let server: MongoMemoryServer;
  let tokenSuperAdmin: string;
  let tokenUsuario: string;
  let categoriaId: string;

  beforeAll(async () => {
    server = await conectarBdTest();

    // Semilla fija — usa helper para crear roles con permiso válido
    const { rolSuperAdmin, rolUsuario } = await sembrarRoles();

    const superAdmin = await User.create({
      nombre: 'Super',
      apellido: 'Admin',
      email: 'superadmin@test.com',
      password: 'SuperAdmin@1',
      fechaNacimiento: new Date('1985-01-01'),
      roles: [rolSuperAdmin._id],
      activo: true,
    });
    tokenSuperAdmin = generarToken(superAdmin._id.toString(), superAdmin.email);

    const usuario = await User.create({
      nombre: 'Usuario',
      apellido: 'Normal',
      email: 'usuario@test.com',
      password: 'Usuario@12345',
      fechaNacimiento: new Date('1995-06-15'),
      roles: [rolUsuario._id],
      activo: true,
    });
    tokenUsuario = generarToken(usuario._id.toString(), usuario.email);

    const categoria = await Category.create({ nombre: 'Electrónica Test' });
    categoriaId = categoria._id.toString();
  });

  afterAll(() => desconectarBdTest(server));

  // Limpiamos solo los items entre tests de escritura
  afterEach(() => Item.deleteMany({}));

  // ──────────────────────────────────────────────
  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Sembramos 3 items para los tests de lectura
      await Promise.all([
        Item.create({ nombre: 'Laptop Test', precioUnitario: 999, stock: 5, category: [categoriaId] }),
        Item.create({ nombre: 'Monitor Test', precioUnitario: 399, stock: 10, category: [categoriaId] }),
        Item.create({ nombre: 'Teclado Test', precioUnitario: 79, stock: 20, category: [categoriaId] }),
      ]);
    });

    test('sin auth → 200 con envelope paginado', async () => {
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.datos).toBeDefined();
      expect(res.body.total).toBeDefined();
      expect(res.body.pagina).toBe(1);
      expect(res.body.totalPaginas).toBeDefined();
    });

    test('con q → filtra por nombre', async () => {
      const res = await request(app).get('/api/products?q=Laptop');

      expect(res.status).toBe(200);
      expect(res.body.datos).toHaveLength(1);
      expect(res.body.datos[0].nombre).toBe('Laptop Test');
    });

    test('con q sin coincidencia → array vacío', async () => {
      const res = await request(app).get('/api/products?q=ProductoInexistente');

      expect(res.status).toBe(200);
      expect(res.body.datos).toHaveLength(0);
      expect(res.body.total).toBe(0);
    });
  });

  // ──────────────────────────────────────────────
  describe('POST /api/products', () => {
    const PRODUCTO_VALIDO = {
      nombre: 'Auriculares Test',
      precioUnitario: 89,
      stock: 15,
    };

    test('sin token → 401', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ ...PRODUCTO_VALIDO, category: [categoriaId] });

      expect(res.status).toBe(401);
    });

    test('con token de usuario normal → 403', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenUsuario}`)
        .send({ ...PRODUCTO_VALIDO, category: [categoriaId] });

      expect(res.status).toBe(403);
    });

    test('con token de superadmin → 201 con producto creado', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenSuperAdmin}`)
        .send({ ...PRODUCTO_VALIDO, category: [categoriaId] });

      expect(res.status).toBe(201);
      expect(res.body.nombre).toBe('Auriculares Test');
      expect(res.body.precioUnitario).toBe(89);
    });

    test('con superadmin pero body inválido → 400', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenSuperAdmin}`)
        .send({ nombre: 'X', precioUnitario: -10 }); // nombre muy corto + precio negativo

      expect(res.status).toBe(400);
      expect(res.body.errores).toBeDefined();
    });
  });
});
