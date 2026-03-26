import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  nombre: string;
  items: Types.ObjectId[];
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
      validate: {
        validator: (arr: Types.ObjectId[]) => arr.length >= 1,
        message: 'Una categoria debe tener al menos 1 item asociado',
      },
    },
  },
  { timestamps: true }
);

export default model<ICategory>('Categoria', categorySchema);