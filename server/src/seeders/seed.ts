import 'dotenv/config';
import mongoose from 'mongoose';
import Permission, { IPermission } from '../models/Permission';
import Role from '../models/Role';
import User from '../models/User';
import PaymentMethod from '../models/paymentMethod';
import { logger } from '../config/logger';

// ─────────────────────────────────────────────────────────────────────────────
// PERMISOS INICIALES
// Al agregar nuevas funcionalidades a la app, agregar los permisos aquí.
// El seeder es idempotente: usa upsert, no duplica datos al ejecutarse varias veces.
// ─────────────────────────────────────────────────────────────────────────────
const PERMISOS_INICIALES: { nombre: string; recurso: string; accion: string; descripcion: string }[] = [
  // Usuarios
  { nombre: 'crear_usuario',    recurso: 'users',       accion: 'create', descripcion: 'Crear nuevos usuarios' },
  { nombre: 'leer_usuario',     recurso: 'users',       accion: 'read',   descripcion: 'Ver usuarios' },
  { nombre: 'editar_usuario',   recurso: 'users',       accion: 'update', descripcion: 'Modificar usuarios existentes' },
  { nombre: 'eliminar_usuario', recurso: 'users',       accion: 'delete', descripcion: 'Eliminar usuarios' },
  // Roles
  { nombre: 'crear_rol',        recurso: 'roles',       accion: 'create', descripcion: 'Crear nuevos roles' },
  { nombre: 'leer_rol',         recurso: 'roles',       accion: 'read',   descripcion: 'Ver roles' },
  { nombre: 'editar_rol',       recurso: 'roles',       accion: 'update', descripcion: 'Modificar roles existentes' },
  { nombre: 'eliminar_rol',     recurso: 'roles',       accion: 'delete', descripcion: 'Eliminar roles' },
  // Permisos
  { nombre: 'crear_permiso',    recurso: 'permissions', accion: 'create', descripcion: 'Crear nuevos permisos' },
  { nombre: 'leer_permiso',     recurso: 'permissions', accion: 'read',   descripcion: 'Ver permisos' },
  { nombre: 'editar_permiso',   recurso: 'permissions', accion: 'update', descripcion: 'Modificar permisos existentes' },
  { nombre: 'eliminar_permiso', recurso: 'permissions', accion: 'delete', descripcion: 'Eliminar permisos' },
];

// ─────────────────────────────────────────────────────────────────────────────
// MÉTODOS DE PAGO INICIALES
// ─────────────────────────────────────────────────────────────────────────────
const METODOS_PAGO_INICIALES = [
  { nombre: 'Tarjeta de crédito', descripcion: 'Pago con tarjeta de crédito (Visa, Mastercard, Amex)' },
  { nombre: 'Tarjeta de débito',  descripcion: 'Pago con tarjeta de débito' },
];

const SUPERADMIN_EMAIL    = 'superadmin@app.com';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'contraseña_superadmin_segura'; // Asegurarse de definir esto en producción
const SUPERADMIN_ROL      = 'superadmin';
const ROL_USUARIO         = 'usuario';

async function seed(): Promise<void> {
  await mongoose.connect(process.env.MONGODB_URI as string);
  logger.info('Conectado a MongoDB');

  // 1. Crear o actualizar todos los permisos definidos arriba
  const permisosGuardados: IPermission[] = [];
  for (const datos of PERMISOS_INICIALES) {
    const permiso = await Permission.findOneAndUpdate(
      { nombre: datos.nombre },
      datos,
      { upsert: true, new: true }
    );
    permisosGuardados.push(permiso);
  }
  logger.info(`✓ ${permisosGuardados.length} permisos sincronizados`);

  // 2. Crear o actualizar el rol SuperAdmin con TODOS los permisos
  const idsTodosLosPermisos = permisosGuardados.map((p) => p._id);
  const rolSuperAdmin = await Role.findOneAndUpdate(
    { nombre: SUPERADMIN_ROL },
    { nombre: SUPERADMIN_ROL, descripcion: 'Acceso total a la aplicación', permisos: idsTodosLosPermisos },
    { upsert: true, new: true }
  );
  logger.info(`✓ Rol '${SUPERADMIN_ROL}' sincronizado`, { permisos: idsTodosLosPermisos.length });

  // 3. Crear o actualizar el rol Usuario con permisos básicos de lectura
  const permisosUsuario = permisosGuardados.filter((p) => p.nombre === 'leer_usuario');
  const rolUsuario = await Role.findOneAndUpdate(
    { nombre: ROL_USUARIO },
    { nombre: ROL_USUARIO, descripcion: 'Usuario estándar de la aplicación', permisos: permisosUsuario.map((p) => p._id) },
    { upsert: true, new: true }
  );
  logger.info(`✓ Rol '${ROL_USUARIO}' sincronizado`);

  // 4. Crear el usuario SuperAdmin si no existe
  const usuarioExistente = await User.findOne({ email: SUPERADMIN_EMAIL });
  if (!usuarioExistente) {
    await User.create({
      nombre: 'Super',
      apellido: 'Admin',
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      fechaNacimiento: new Date(1990, 0, 1),
      roles: [rolSuperAdmin._id],
    });
    logger.info(`✓ Usuario SuperAdmin creado`, { email: SUPERADMIN_EMAIL });
    logger.warn(`Contraseña inicial expuesta en log — cambiar en producción`, { password: SUPERADMIN_PASSWORD });
  } else {
    // Asegurarse de que tenga el rol superadmin asignado
    if (!usuarioExistente.roles.some((r) => r.equals(rolSuperAdmin._id))) {
      usuarioExistente.roles.push(rolSuperAdmin._id);
      await usuarioExistente.save();
      logger.info(`✓ Rol '${SUPERADMIN_ROL}' asignado al usuario SuperAdmin existente`);
    } else {
      logger.info(`✓ Usuario SuperAdmin ya existe`, { email: SUPERADMIN_EMAIL });
    }
  }

  // 5. Crear o actualizar los métodos de pago
  for (const datos of METODOS_PAGO_INICIALES) {
    await PaymentMethod.findOneAndUpdate(
      { nombre: datos.nombre },
      { ...datos, activo: true },
      { upsert: true, new: true }
    );
  }
  logger.info(`✓ ${METODOS_PAGO_INICIALES.length} métodos de pago sincronizados`);

  await mongoose.disconnect();
  logger.info('Seeder finalizado');
}

seed().catch((error) => {
  logger.error('Error en el seeder', { error: String(error) });
  process.exit(1);
});