import { Schema, model, Document, Types } from 'mongoose';
import { aplicarDescuentos } from '../utils/descuentos';

// Forma del documento PurchaseOrderDetail en la base de datos
export interface IPurchaseOrderDetail extends Document {
  _id: Types.ObjectId;
  item: Types.ObjectId;
  cantidad: number;
  precioUnitario: number;
  descuentos: number[];
  monto: number;
}

const purchaseOrderDetailSchema = new Schema<IPurchaseOrderDetail>(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'El item es obligatorio'],
    },
    cantidad: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad debe ser al menos 1'],
    },
    precioUnitario: {
      type: Number,
      required: [true, 'El precio unitario es obligatorio'],
      min: [0, 'El precio unitario no puede ser negativo'],
    },
    descuentos: {
      type: [Number],
      default: [],
    },
    monto: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Calcula el monto antes de guardar
purchaseOrderDetailSchema.pre('save', function (next) {
  const subtotal = this.precioUnitario * this.cantidad;
  this.monto = aplicarDescuentos(subtotal, this.descuentos);
  next();
});

export default model<IPurchaseOrderDetail>('PurchaseOrderDetail', purchaseOrderDetailSchema);