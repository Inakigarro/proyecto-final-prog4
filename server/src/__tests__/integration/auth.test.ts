/**
 * Tests de integración para los endpoints de autenticación.
 * Cubre: register, login, refresh, credenciales inválidas.
 * Usa MongoMemoryReplSet porque authController.register utiliza transacciones MongoDB.
 */
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import request from 'supertest';
import { crearApp } from '../../app';
import {
  conectarBdReplTest,
  desconectarBdTest,
  limpiarColecciones,
  sembrarRoles,
} from './helpers';

jest.setTimeout(60000);

const app = crearApp();

describe('Auth endpoints', () => {
  let server: MongoMemoryReplSet;

  beforeAll(async () => {
    server = await conectarBdReplTest();
  });

  afterAll(() => desconectarBdTest(server));

  beforeEach(async () => {
    await limpiarColecciones();
    // El controller register requiere que el rol 'usuario' exista con al menos 1 permiso
    await sembrarRoles();
  });

  // ──────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    const USUARIO_VALIDO = {
      nombre: 'Juan',
      apellido: 'Perez',
      email: 'juan@test.com',
      password: 'Juan@12345',
      fechaNacimiento: '01/01/1990',
    };

    test('happy path → 201 con datos del usuario (sin password)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(USUARIO_VALIDO);

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('juan@test.com');
      expect(res.body.password).toBeUndefined();
    });

    test('email inválido → 400 con errores de validación', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...USUARIO_VALIDO, email: 'no-es-un-email' });

      expect(res.status).toBe(400);
      expect(res.body.errores).toBeDefined();
    });

    test('campos faltantes → 400 con errores de validación', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incompleto@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.errores).toBeDefined();
    });

    test('password débil → 400 con error de validación', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...USUARIO_VALIDO, password: '12345678' });

      expect(res.status).toBe(400);
      expect(res.body.errores).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Registrar un usuario para poder hacer login
      await request(app).post('/api/auth/register').send({
        nombre: 'Ana',
        apellido: 'Lopez',
        email: 'ana@test.com',
        password: 'Ana@12345',
        fechaNacimiento: '15/06/1992',
      });
    });

    test('credenciales válidas → 200 con accessToken y refreshToken', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ana@test.com', password: 'Ana@12345' });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    test('contraseña incorrecta → 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ana@test.com', password: 'Wrong@12345' });

      expect(res.status).toBe(401);
    });

    test('email inexistente → 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'noexiste@test.com', password: 'Algo@12345' });

      expect(res.status).toBe(401);
    });
  });

  // ──────────────────────────────────────────────
  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        nombre: 'Pedro',
        apellido: 'Gomez',
        email: 'pedro@test.com',
        password: 'Pedro@12345',
        fechaNacimiento: '20/03/1988',
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'pedro@test.com', password: 'Pedro@12345' });

      refreshToken = loginRes.body.refreshToken;
    });

    test('refresh token válido → 200 con nuevos tokens', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    test('refresh token inválido → 401', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'token-invalido-completamente-falso' });

      expect(res.status).toBe(401);
    });

    test('body sin refreshToken → 400', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(res.status).toBe(400);
    });
  });
});
