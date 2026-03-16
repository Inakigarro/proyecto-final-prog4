import { Schema, model, Document, Types } from 'mongoose';

// Forma del documento Role en la base de datos
export interface IRole extends Document {
  _id: Types.ObjectId;
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
    nombre: { 
      type: String,
      required: [true, 'El nombre del rol es obligatorio'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre del rol debe tener al menos 3 caracteres']
    },
    descripcion: { type: String, trim: true },
    // Lista de permisos — un rol debe tener al menos 1
    permisos: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
      validate: {
        validator: (permisos: Types.ObjectId[]) => permisos.length >= 1,
        message: 'El rol debe tener al menos un permiso asignado',
      },
    },
  },
  { timestamps: true }
);

export default model<IRole>('Role', rolSchema);
