import 'dotenv/config';
import mongoose from 'mongoose';
import Permission, { IPermission } from '../models/Permission';
import Role from '../models/Role';
import User from '../models/User';
import { Accion } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// PERMISOS INICIALES
// Al agregar nuevas funcionalidades a la app, agregar los permisos aquí.
// El seeder es idempotente: usa upsert, no duplica datos al ejecutarse varias veces.
// ─────────────────────────────────────────────────────────────────────────────
const PERMISOS_INICIALES: { nombre: string; recurso: string; accion: Accion; descripcion: string }[] = [
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

const SUPERADMIN_EMAIL    = 'superadmin@app.com';
const SUPERADMIN_PASSWORD = 'SuperAdmin123!';
const SUPERADMIN_ROL      = 'superadmin';

async function seed(): Promise<void> {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Conectado a MongoDB');

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
  console.log(`✓ ${permisosGuardados.length} permisos sincronizados`);

  // 2. Crear o actualizar el rol SuperAdmin con TODOS los permisos
  const idsTodosLosPermisos = permisosGuardados.map((p) => p._id);
  const rolSuperAdmin = await Role.findOneAndUpdate(
    { nombre: SUPERADMIN_ROL },
    { nombre: SUPERADMIN_ROL, descripcion: 'Acceso total a la aplicación', permisos: idsTodosLosPermisos },
    { upsert: true, new: true }
  );
  console.log(`✓ Rol '${SUPERADMIN_ROL}' sincronizado con ${idsTodosLosPermisos.length} permisos`);

  // 3. Crear el usuario SuperAdmin si no existe
  const usuarioExistente = await User.findOne({ email: SUPERADMIN_EMAIL });
  if (!usuarioExistente) {
    await User.create({
      nombre: 'Super Admin',
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      roles: [rolSuperAdmin._id],
    });
    console.log(`✓ Usuario SuperAdmin creado: ${SUPERADMIN_EMAIL}`);
    console.log(`  Contraseña inicial: ${SUPERADMIN_PASSWORD}  ← cambiar en producción`);
  } else {
    // Asegurarse de que tenga el rol superadmin asignado
    if (!usuarioExistente.roles.some((r) => r.equals(rolSuperAdmin._id))) {
      usuarioExistente.roles.push(rolSuperAdmin._id);
      await usuarioExistente.save();
      console.log(`✓ Rol '${SUPERADMIN_ROL}' asignado al usuario SuperAdmin existente`);
    } else {
      console.log(`✓ Usuario SuperAdmin ya existe: ${SUPERADMIN_EMAIL}`);
    }
  }

  await mongoose.disconnect();
  console.log('Seeder finalizado');
}

seed().catch((error) => {
  console.error('Error en el seeder:', error);
  process.exit(1);
});
