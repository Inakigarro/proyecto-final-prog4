import { Schema, model, Document, Types } from 'mongoose';

export interface IItem extends Document {
  _id: Types.ObjectId;
  nombre: string;
  descripcion?: string;
  precioUnitario: number;
  stock: number;
  category: Types.ObjectId[];
  activo: boolean;
}

const itemSchema = new Schema<IItem>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del item es obligatorio'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre del item debe tener al menos 3 caracteres'],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede superar los 500 caracteres'],
    },
    precioUnitario: {
      type: Number,
      required: [true, 'El precio unitario es obligatorio'],
      min: [0, 'El precio unitario no puede ser negativo'],
    },
    /**
     * Stock disponible del item. El default es 0 para no romper documentos
     * preexistentes en la base. El frontend debe restringir la creación y
     * edición de items para que siempre se cargue un valor explícito.
     */
    stock: {
      type: Number,
      default: 0,
      min: [0, 'El stock no puede ser negativo'],
    },
    category: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
    ],
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IItem>('Item', itemSchema);
