import { Schema, model, Document, Types } from 'mongoose';

// Forma del documento PurchaseOrder en la base de datos
export interface IPurchaseOrder extends Document {
  _id: Types.ObjectId;
  usuario: Types.ObjectId;
  detalles: Types.ObjectId[];
  metodoPago: Types.ObjectId;
  descuentos: number[];
  montoTotal: number;
}

/**
 * Calcula el monto total de la orden aplicando los descuentos acumulados.
 * Cada descuento se aplica como un porcentaje (0-100) sobre el monto.
 */
const calcularMontoTotal = (montoBase: number, descuentos: number[]): number => {
  const factorDescuento = descuentos.reduce((acc, descuento) => acc * (1 - descuento / 100), 1);
  return parseFloat((montoBase * factorDescuento).toFixed(2));
};

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

export default model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);