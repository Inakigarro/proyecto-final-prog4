import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

// Forma del documento User en la base de datos
export interface IUser extends Document {
  _id: Types.ObjectId;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  fechaNacimiento: Date;
  telefono?: string;
  activo: boolean;
  roles: Types.ObjectId[];
  /** Dirección de envío guardada (opcional, se actualiza en cada checkout). */
  direccion?: string;
  /** Teléfono de contacto guardado (opcional, 10 dígitos: cód. área + número). */
  telefono?: string;
  // Método de instancia para verificar la contraseña
  compararPassword(passwordPlano: string): Promise<boolean>;
}

/**
 * Regex para teléfonos de Argentina con código de país.
 * Acepta formatos como: "+54 9 11 1234 5678", "+54 11 12345678", "+5491112345678".
 * Empieza con +54, opcionalmente seguido de un 9 (móvil), luego entre 10 y 11
 * dígitos en total separados por espacios o guiones.
 */
export const TELEFONO_AR_REGEX = /^\+54[\s-]?9?[\s-]?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{4}$/;

/**
 * Valida que la contraseña cumpla los requisitos de complejidad:
 * mínimo 8 caracteres, una mayúscula, una minúscula y un símbolo especial.
 * Se exporta para poder reutilizarla en tests u otros contextos.
 */
export const validarComplejidadPassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&        // al menos una mayúscula
    /[a-z]/.test(password) &&        // al menos una minúscula
    /[0-9]/.test(password) &&        // al menos un número
    /[^A-Za-z0-9]/.test(password)    // al menos un símbolo especial
  );
};

/**
 * Usuario de la aplicación.
 * La contraseña se hashea automáticamente antes de guardar.
 */
const usuarioSchema = new Schema<IUser>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    },
    apellido: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true,
      minlength: [3, 'El apellido debe tener al menos 3 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [11, 'El email debe tener al menos 11 caracteres'],
      // Exige mínimo 3 chars en parte local, @, mínimo 3 chars de dominio, punto y TLD
      match: [/^[^\s@]{3,}@[^\s@]{3,}\.[^\s@]+$/, 'El email debe tener el formato <parte-local>@<dominio>.<TLD> con al menos 3 caracteres en cada parte'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      select: false, // no se devuelve en queries por defecto
      validate: {
        validator: validarComplejidadPassword,
        message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo especial',
      },
    },
    fechaNacimiento: {
      type: Date,
      required: [true, 'La fecha de nacimiento es obligatoria'],
    },
    // Teléfono argentino opcional. Si se provee, debe respetar el formato +54 9 ...
    telefono: {
      type: String,
      trim: true,
      validate: {
        validator: (valor: string) => !valor || TELEFONO_AR_REGEX.test(valor),
        message: 'El teléfono debe tener formato argentino, p.ej. +54 9 11 1234 5678',
      },
    },
    activo: { type: Boolean, default: true },
    // Lista de roles — un usuario debe tener al menos 1
    roles: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
      validate: {
        validator: (roles: Types.ObjectId[]) => roles.length >= 1,
        message: 'El usuario debe tener al menos un rol asignado',
      },
    },
    direccion: {
      type: String,
      trim: true,
      default: undefined,
    },
    telefono: {
      type: String,
      trim: true,
      default: undefined,
      validate: {
        validator: (v: string | undefined) => !v || /^\d{10}$/.test(v),
        message: 'El teléfono debe tener exactamente 10 dígitos numéricos (código de área + número)',
      },
    },
  },
  { timestamps: true }
);

// Hashea la contraseña antes de guardar si fue modificada
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compara una contraseña en texto plano con el hash almacenado
usuarioSchema.methods.compararPassword = function (passwordPlano: string): Promise<boolean> {
  return bcrypt.compare(passwordPlano, this.password);
};

export default model<IUser>('User', usuarioSchema);