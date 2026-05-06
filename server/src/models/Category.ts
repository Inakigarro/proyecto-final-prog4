import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  nombre: string;
  items: Types.ObjectId[];
  activo: boolean;
}

const categorySchema = new Schema<ICategory>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la categoria es obligatorio'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre de la categoria debe tener al menos 3 caracteres'],
    },
    items: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
      default: [],
    },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<ICategory>('Category', categorySchema);
