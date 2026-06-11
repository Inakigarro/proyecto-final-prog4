import { Schema, model, Document, Types } from 'mongoose';

/**
 * Tipos de promoción soportados.
 * Cada tipo requiere parámetros específicos validados en el hook `pre('validate')`.
 */
export type TipoPromocion = 'DESCUENTO_PORCENTUAL' | 'NXM' | 'SEGUNDA_UNIDAD';

const TIPOS_PROMOCION: TipoPromocion[] = [
  'DESCUENTO_PORCENTUAL',
  'NXM',
  'SEGUNDA_UNIDAD',
];

export interface IParametrosPromocion {
  /** Porcentaje 0-100 para DESCUENTO_PORCENTUAL */
  porcentaje?: number;
  /** Cantidad que el cliente lleva (ej. 3 en una 3x2) */
  cantidadLleva?: number;
  /** Cantidad que el cliente paga (ej. 2 en una 3x2) */
  cantidadPaga?: number;
  /** Descuento aplicado a la segunda unidad (0-100) en SEGUNDA_UNIDAD */
  descuentoSegundaUnidad?: number;
}

export interface IPromotion extends Document {
  _id: Types.ObjectId;
  nombre: string;
  tipo: TipoPromocion;
  parametros: IParametrosPromocion;
  productos: Types.ObjectId[];
  activo: boolean;
}

const parametrosSchema = new Schema<IParametrosPromocion>(
  {
    porcentaje:              { type: Number, min: 0, max: 100 },
    cantidadLleva:           { type: Number, min: 1 },
    cantidadPaga:            { type: Number, min: 1 },
    descuentoSegundaUnidad:  { type: Number, min: 0, max: 100 },
  },
  { _id: false },
);

const promotionSchema = new Schema<IPromotion>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la promoción es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    },
    tipo: {
      type: String,
      enum: TIPOS_PROMOCION,
      required: [true, 'El tipo de promoción es obligatorio'],
    },
    parametros: { type: parametrosSchema, default: {} },
    productos: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
      default: [],
    },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/** Valida que los parámetros sean coherentes con el tipo de promoción declarado */
promotionSchema.pre('validate', function (next) {
  const { tipo, parametros } = this;
  if (tipo === 'DESCUENTO_PORCENTUAL' && parametros?.porcentaje == null) {
    return next(new Error('DESCUENTO_PORCENTUAL requiere parametros.porcentaje'));
  }
  if (tipo === 'NXM') {
    if (parametros?.cantidadLleva == null || parametros?.cantidadPaga == null) {
      return next(new Error('NXM requiere parametros.cantidadLleva y parametros.cantidadPaga'));
    }
    if (parametros.cantidadLleva <= parametros.cantidadPaga) {
      return next(new Error('En NXM, cantidadLleva debe ser mayor a cantidadPaga'));
    }
  }
  if (tipo === 'SEGUNDA_UNIDAD' && parametros?.descuentoSegundaUnidad == null) {
    return next(new Error('SEGUNDA_UNIDAD requiere parametros.descuentoSegundaUnidad'));
  }
  next();
});

export default model<IPromotion>('Promotion', promotionSchema);
