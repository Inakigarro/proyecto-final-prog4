import { Schema, model, Document, Types } from 'mongoose';

export interface IPasswordResetToken extends Document {
  token: string;
  usuario: Types.ObjectId;
  expiresAt: Date;
}

/**
 * Token temporal para restablecer la contraseña.
 * Se genera en /forgot-password y se consume (y elimina) en /reset-password.
 * MongoDB lo elimina automáticamente al vencer (TTL index).
 */
const passwordResetTokenSchema = new Schema<IPasswordResetToken>({
  token: { type: String, required: true, unique: true },
  usuario: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true, expires: 0 }, // TTL — auto-delete on expiry
});

export default model<IPasswordResetToken>('PasswordResetToken', passwordResetTokenSchema);
