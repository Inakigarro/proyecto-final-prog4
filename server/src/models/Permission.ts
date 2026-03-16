import { Schema, model, Document, Types } from 'mongoose';

// Forma del documento Permission en la base de datos
export interface IPermission extends Document {
  _id: Types.ObjectId;
  nombre: string;
  valor: string;
  descripcion?: string;
}

/**
 * Permiso atómico que representa una funcionalidad de la aplicación.
 * Ejemplo: { nombre: 'crear_usuario', valor: 'users/create' }
 */
const permisoSchema = new Schema<IPermission>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del permiso es obligatorio'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre del permiso debe tener al menos 3 caracteres'],
    },
    // Identificador funcional del permiso — formato <recurso>/<accion>
    valor: {
      type: String,
      required: [true, 'El valor del permiso es obligatorio'],
      unique: true,
      trim: true,
    },
    descripcion: { type: String, trim: true },
  },
  { timestamps: true }
);

export default model<IPermission>('Permission', permisoSchema);
