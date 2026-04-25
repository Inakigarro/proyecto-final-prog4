import { Schema, model, Document, Types } from 'mongoose';
import PurchaseOrderDetail from './purchaseOrderDetail';

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

// Calcula el monto total antes de guardar sumando los montos de los detalles
// y aplicando los descuentos a nivel de orden
purchaseOrderSchema.pre('save', async function (next) {
  const detalles = await PurchaseOrderDetail.find({ _id: { $in: this.detalles } });
  const montoBase = detalles.reduce((acc, detalle) => acc + detalle.monto, 0);
  this.montoTotal = calcularMontoTotal(montoBase, this.descuentos);
  next();
});

export default model<IPurchaseOrder>('PurchaseOrder', purchaseOrderSchema);