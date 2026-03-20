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
  email: string;
  password: string;
  roles?: Types.ObjectId[];
}

// Datos para actualizar un usuario (password es opcional)
export interface UsuarioUpdateInput {
  nombre?: string;
  email?: string;
  password?: string;
  activo?: boolean;
  roles?: Types.ObjectId[];
}

// Datos para el login
export interface LoginInput {
  email: string;
  password: string;
}

// Datos para el registro (igual que crear usuario, sin roles — se asignan después)
export interface RegisterInput {
  nombre: string;
  email: string;
  password: string;
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

// DTO para crear un permiso
export interface CrearPermisoDto {
  nombre: string;
  recurso: string;
  accion: Accion;
  descripcion?: string;
}

// DTO para actualizar un permiso (todos opcionales)
export interface ActualizarPermisoDto {
  nombre?: string;
  recurso?: string;
  accion?: Accion;
  descripcion?: string;
}