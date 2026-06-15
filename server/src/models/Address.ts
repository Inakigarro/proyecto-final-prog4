import { Schema, model, Document, Types } from 'mongoose';

/**
 * Dirección postal asociada a un usuario.
 * El borrado es lógico (campo activo) para no perder referencias históricas
 * que puedan estar enganchadas a órdenes de compra futuras.
 */
export interface IAddress extends Document {
  _id: Types.ObjectId;
  usuario: Types.ObjectId;
  calle: string;
  numero: string;
  piso?: string;
  departamento?: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  activo: boolean;
}

const direccionSchema = new Schema<IAddress>(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio'],
      index: true,
    },
    calle: {
      type: String,
      required: [true, 'La calle es obligatoria'],
      trim: true,
      minlength: [2, 'La calle debe tener al menos 2 caracteres'],
      maxlength: [100, 'La calle no puede superar los 100 caracteres'],
    },
    numero: {
      type: String,
      required: [true, 'El número es obligatorio'],
      trim: true,
      maxlength: [10, 'El número no puede superar los 10 caracteres'],
    },
    piso: {
      type: String,
      trim: true,
      maxlength: [10, 'El piso no puede superar los 10 caracteres'],
    },
    departamento: {
      type: String,
      trim: true,
      maxlength: [10, 'El departamento no puede superar los 10 caracteres'],
    },
    ciudad: {
      type: String,
      required: [true, 'La ciudad es obligatoria'],
      trim: true,
      minlength: [2, 'La ciudad debe tener al menos 2 caracteres'],
      maxlength: [80, 'La ciudad no puede superar los 80 caracteres'],
    },
    provincia: {
      type: String,
      required: [true, 'La provincia es obligatoria'],
      trim: true,
      minlength: [2, 'La provincia debe tener al menos 2 caracteres'],
      maxlength: [80, 'La provincia no puede superar los 80 caracteres'],
    },
    codigoPostal: {
      type: String,
      required: [true, 'El código postal es obligatorio'],
      trim: true,
      maxlength: [10, 'El código postal no puede superar los 10 caracteres'],
    },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IAddress>('Address', direccionSchema);
