import { Schema, model, Document, Types } from 'mongoose';

// Forma del documento Role en la base de datos
export interface IRole extends Document {
  nombre: string;
  descripcion?: string;
  permisos: Types.ObjectId[];
}

/**
 * Rol que agrupa permisos.
 * Ejemplo: { nombre: 'admin', permisos: [ObjectId, ObjectId] }
 */
const rolSchema = new Schema<IRole>(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    descripcion: { type: String, trim: true },
    // Lista de permisos asignados a este rol
    permisos: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
  },
  { timestamps: true }
);

export default model<IRole>('Role', rolSchema);
