/**
 * Utilidades compartidas para tests de integración.
 * Cada archivo de test gestiona su propio servidor de MongoDB en memoria.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Permission from '../../models/Permission';
import Role from '../../models/Role';

// Variables de entorno mínimas para que la app funcione en tests
process.env.JWT_SECRET = 'test-jwt-secret-no-usar-en-produccion';
process.env.SUPERADMIN_PASSWORD = 'TestSuperAdmin@1';

/**
 * Levanta un MongoMemoryServer (instancia simple, sin réplicas).
 * Suficiente para tests que NO usan transacciones.
 */
export async function conectarBdTest(): Promise<MongoMemoryServer> {
  const server = await MongoMemoryServer.create();
  await mongoose.connect(server.getUri());
  return server;
}

/**
 * Levanta un MongoMemoryReplSet (réplica set de 1 nodo).
 * Necesario para tests que SÍ usan transacciones (ej: CartService.checkout).
 */
export async function conectarBdReplTest(): Promise<MongoMemoryReplSet> {
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri());
  return replSet;
}

/** Desconecta Mongoose y detiene el servidor en memoria */
export async function desconectarBdTest(
  server: MongoMemoryServer | MongoMemoryReplSet
): Promise<void> {
  await mongoose.disconnect();
  await server.stop();
}

/** Elimina todos los documentos de todas las colecciones (aislamiento entre tests) */
export async function limpiarColecciones(): Promise<void> {
  const colecciones = Object.values(mongoose.connection.collections);
  await Promise.all(colecciones.map((c) => c.deleteMany({})));
}

/**
 * Siembra los roles 'usuario' y 'superadmin' con un permiso dummy.
 * El modelo Role exige permisos.length >= 1, por eso se crea uno primero.
 * Devuelve los ObjectId de los roles para usarlos en la creación de usuarios.
 */
export async function sembrarRoles() {
  const permiso = await Permission.create({
    nombre: 'permiso-test',
    recurso: 'test',
    accion: 'read',
  });

  const [rolUsuario, rolSuperAdmin] = await Promise.all([
    Role.create({ nombre: 'usuario',    permisos: [permiso._id] }),
    Role.create({ nombre: 'superadmin', permisos: [permiso._id] }),
  ]);

  return { rolUsuario, rolSuperAdmin, permiso };
}

/** Genera un JWT de acceso válido para usar en peticiones de test */
export function generarToken(userId: string, email: string): string {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' }
  );
}
