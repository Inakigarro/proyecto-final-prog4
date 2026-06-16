import { Schema, model, Document, Types } from 'mongoose';

/**
 * Slide del slider del home. La imagen se sirve estáticamente desde
 * /uploads/slides/<archivo> (configurado en app.ts). El frontend recibe
 * la URL absoluta del backend para mostrarla sin necesidad de prefijos.
 *
 * El borrado es lógico (campo `activo`) para no perder referencias y
 * permitir reactivar un slide sin volver a subir la imagen.
 */
export interface ISlide extends Document {
  _id: Types.ObjectId;
  /** URL absoluta servida por el backend, ej. http://localhost:4000/uploads/slides/123.jpg */
  imagen: string;
  /** Texto alternativo para accesibilidad. */
  alt: string;
  /** Leyenda visible sobre la imagen del slider. */
  leyenda: string;
  /** Entero usado para sortear los slides en el slider; ascendente. */
  orden: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const slideSchema = new Schema<ISlide>(
  {
    imagen: {
      type: String,
      required: [true, 'La imagen es obligatoria'],
      // Soporta tanto URLs http(s) como data URIs base64 (data:image/...;base64,...).
      // Cap dimensionado para un archivo de hasta 5MB en base64 con margen.
      maxlength: [10_000_000, 'La imagen excede el tamaño máximo permitido'],
    },
    alt: {
      type: String,
      required: [true, 'El texto alternativo es obligatorio'],
      trim: true,
      minlength: [2, 'El texto alternativo debe tener al menos 2 caracteres'],
      maxlength: [120, 'El texto alternativo no puede superar los 120 caracteres'],
    },
    leyenda: {
      type: String,
      required: [true, 'La leyenda es obligatoria'],
      trim: true,
      minlength: [2, 'La leyenda debe tener al menos 2 caracteres'],
      maxlength: [200, 'La leyenda no puede superar los 200 caracteres'],
    },
    orden: {
      type: Number,
      required: [true, 'El orden es obligatorio'],
      default: 0,
      min: [0, 'El orden no puede ser negativo'],
    },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<ISlide>('Slide', slideSchema);
