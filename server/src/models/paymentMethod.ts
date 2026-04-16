import { Schema, model, Document, Types } from 'mongoose';

// Forma del documento PaymentMethod en la base de datos
export interface IPaymentMethod extends Document {
  _id: Types.ObjectId;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

/**
 * Método de pago disponible en la plataforma.
 * Solo el administrador puede crear y gestionar métodos de pago.
 */
const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del método de pago es obligatorio'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default model<IPaymentMethod>('PaymentMethod', paymentMethodSchema);