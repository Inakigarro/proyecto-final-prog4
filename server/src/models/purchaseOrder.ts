import { Schema, model, Document, Types } from 'mongoose';

// Forma del documento PurchaseOrder en la base de datos
export interface IPurchaseOrder extends Document {
  _id: Types.ObjectId;
  usuario: Types.ObjectId;
  detalles: Types.ObjectId[];
  metodoPago: Types.ObjectId;
  descuentos: number[];
  montoTotal: number;
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
  },
  { timestamps: true }
);

// Nota: montoTotal es calculado y asignado explícitamente por CartService.checkout
// antes de llamar a PurchaseOrder.create(). No se recalcula en pre-save porque
// la consulta a PurchaseOrderDetail no puede ver detalles no confirmados
// dentro de una sesión de transacción activa.

export default model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);