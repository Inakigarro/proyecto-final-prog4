import { Schema, model, Document, Types } from 'mongoose';

// Forma del documento PurchaseOrder en la base de datos
export interface IPurchaseOrder extends Document {
  _id: Types.ObjectId;
  usuario: Types.ObjectId;
  detalles: Types.ObjectId[];
  metodoPago: Types.ObjectId;
  descuentos: number[];
  montoTotal: number;
  /** Snapshot de datos de envío al momento de la compra */
  envio: {
    nombre: string;
    apellido: string;
    direccion: string;
    telefono: string;
  };
  /** Snapshot de datos de la tarjeta (solo info para mostrar, no sensitiva) */
  tarjeta: {
    marca: string;
    ultimos4: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario es obligatorio'],
    },
    detalles: {
      type: [{ type: Schema.Types.ObjectId, ref: 'PurchaseOrderDetail' }],
      default: [],
    },
    metodoPago: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentMethod',
      required: [true, 'El método de pago es obligatorio'],
    },
    descuentos: {
      type: [Number],
      default: [],
    },
    montoTotal: {
      type: Number,
      default: 0,
    },
    envio: {
      nombre: { type: String, required: [true, 'El nombre de envío es obligatorio'], trim: true },
      apellido: { type: String, required: [true, 'El apellido de envío es obligatorio'], trim: true },
      direccion: { type: String, required: [true, 'La dirección de envío es obligatoria'], trim: true },
      telefono: {
        type: String,
        required: [true, 'El teléfono de envío es obligatorio'],
        trim: true,
        validate: {
          validator: (v: string) => /^\d{10}$/.test(v),
          message: 'El teléfono debe tener exactamente 10 dígitos',
        },
      },
    },
    tarjeta: {
      marca: { type: String, required: [true, 'La marca de la tarjeta es obligatoria'], trim: true },
      ultimos4: {
        type: String,
        required: [true, 'Los últimos 4 dígitos son obligatorios'],
        validate: {
          validator: (v: string) => /^\d{4}$/.test(v),
          message: 'Deben ser exactamente 4 dígitos',
        },
      },
    },
  },
  { timestamps: true }
);

// Nota: montoTotal es calculado y asignado explícitamente por CartService.checkout
// antes de llamar a PurchaseOrder.create(). No se recalcula en pre-save porque
// la consulta a PurchaseOrderDetail no puede ver detalles no confirmados
// dentro de una sesión de transacción activa.

export default model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);