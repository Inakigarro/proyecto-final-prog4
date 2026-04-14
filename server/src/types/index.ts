import { Types } from 'mongoose';
import { Request } from 'express';

// Acciones posibles sobre un recurso
export type Accion = 'create' | 'read' | 'update' | 'delete';

// Datos para crear o actualizar un permiso
export interface PermisoInput {
  nombre: string;
  recurso: string;
  accion: Accion;
  descripcion?: string;
}

// Datos para crear o actualizar un rol
export interface RolInput {
  nombre: string;
  descripcion?: string;
  permisos?: Types.ObjectId[];
}

// Datos para crear un usuario
export interface UsuarioInput {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  fechaNacimiento: string; // dd/MM/YYYY — se convierte a Date en el controller
  roles?: Types.ObjectId[];
}

// Datos para actualizar un usuario (todos opcionales)
export interface UsuarioUpdateInput {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  fechaNacimiento?: string; // dd/MM/YYYY — se convierte a Date en el controller
  activo?: boolean;
  roles?: Types.ObjectId[];
}

// Datos para el login
export interface LoginInput {
  email: string;
  password: string;
}

// Datos para el registro (sin roles — se asigna el rol 'usuario' automáticamente)
export interface RegisterInput {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  fechaNacimiento: string; // dd/MM/YYYY — se convierte a Date en el controller
}

// Payload que se guarda dentro del JWT
export interface JwtPayload {
  id: string;
  email: string;
}

// Respuesta estándar de login y refresh
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// Extiende Request de Express para incluir el usuario autenticado
export interface RequestConUsuario extends Request {
  usuario?: JwtPayload;
}

// DTO de respuesta para permisos (evita exponer campos internos)
export interface PermisoResponseDto {
  id: string;
  nombre: string;
  recurso: string;
  accion: Accion;
  descripcion?: string;
}

// DTO de respuesta para roles (evita exponer campos internos)
export interface RolResponseDto {
  id: string;
  nombre: string;
  descripcion?: string;
  permisos: PermisoResponseDto[];
}

// DTO de respuesta para usuarios (nunca expone la contraseña)
export interface UsuarioResponseDto {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento: Date;
  activo: boolean;
  roles: RolResponseDto[];
}

// DTO para crear un usuario
export interface CrearUsuarioDto {
  nombre: string;
  email: string;
  password: string;
  roles?: Types.ObjectId[];
}

// DTO para actualizar un usuario
export interface ActualizarUsuarioDto {
  nombre?: string;
  email?: string;
  password?: string;
  activo?: boolean;
  roles?: Types.ObjectId[];
}