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
  activo: boolean;
  roles: Types.ObjectId[];
  // Método de instancia para verificar la contraseña
  compararPassword(passwordPlano: string): Promise<boolean>;
}

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
    activo: { type: Boolean, default: true },
    // Lista de roles — un usuario debe tener al menos 1
    roles: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
      validate: {
        validator: (roles: Types.ObjectId[]) => roles.length >= 1,
        message: 'El usuario debe tener al menos un rol asignado',
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
