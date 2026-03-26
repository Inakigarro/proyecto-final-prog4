import { Schema, model, Document } from 'mongoose';
import { Accion } from '../types';

// Forma del documento Permission en la base de datos
export interface IPermission extends Document {
  nombre: string;
  recurso: string;
  accion: Accion;
  descripcion?: string;
}

/**
 * Permiso atómico sobre un recurso.
 * Ejemplo: { nombre: 'crear_usuario', recurso: 'users', accion: 'create' }
 */
const permisoSchema = new Schema<IPermission>(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    recurso: { type: String, required: true, trim: true },
    accion: {
      type: String,
      required: true,
      enum: ['create', 'read', 'update', 'delete'] satisfies Accion[],
    },
    descripcion: { type: String, trim: true },
  },
  { timestamps: true }
);

export default model<IPermission>('Permission', permisoSchema);