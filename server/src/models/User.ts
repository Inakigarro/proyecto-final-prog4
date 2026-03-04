import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

// Forma del documento User en la base de datos
export interface IUser extends Document {
  nombre: string;
  email: string;
  password: string;
  activo: boolean;
  roles: Types.ObjectId[];
  // Método de instancia para verificar la contraseña
  compararPassword(passwordPlano: string): Promise<boolean>;
}

/**
 * Usuario de la aplicación.
 * La contraseña se hashea automáticamente antes de guardar.
 */
const usuarioSchema = new Schema<IUser>(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // no se devuelve en queries por defecto
    },
    activo: { type: Boolean, default: true },
    // Lista de roles asignados al usuario
    roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
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
