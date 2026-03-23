import { Schema, model, Document, Types } from 'mongoose';

// Forma del documento Role en la base de datos
export interface IItem extends Document {
  _id: Types.ObjectId;
  nombre: string;
  precioUnitario: number;
  category: Types.ObjectId[];
}


const itemSchema = new Schema<IItem>(
  {
    nombre: { 
      type: String,
      required: [true, 'El nombre del item es obligatorio'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre del item debe tener al menos 3 caracteres']
    },
    precioUnitario: { 
      type: Number,
      required: [true, 'El precio unitario es obligatorio'],
      min: [0, 'El precio unitario no puede ser negativo']
     },
    
    category: [
    {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
    }
]
    
  },
  { timestamps: true }
);

export default model<IItem>('Item', itemSchema);
