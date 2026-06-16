import { Schema, model, Document, Types } from 'mongoose';

export interface IPasswordChangeChallenge extends Document {
  usuario: Types.ObjectId;
  /** Hash bcrypt del código de 6 dígitos enviado por email */
  codigoHash: string;
  /** Hash bcrypt de la nueva contraseña — se aplica al usuario al confirmar */
  nuevaPasswordHash: string;
  /** Cantidad de intentos fallidos consumidos */
  intentos: number;
  expiresAt: Date;
}

/**
 * Challenge temporal de cambio de contraseña con verificación por email.
 *
 * Flujo:
 *  1. El usuario solicita un cambio → se crea un challenge con un código de 6
 *     dígitos enviado por email y la nueva contraseña ya hasheada.
 *  2. El usuario ingresa el código → si matchea con el hash y no expiró, se
 *     aplica `nuevaPasswordHash` al documento User.
 *
 * MongoDB elimina el challenge automáticamente al vencer (TTL index).
 * Cualquier nuevo request del mismo usuario invalida los anteriores
 * (deleteMany por usuario).
 */
const passwordChangeChallengeSchema = new Schema<IPasswordChangeChallenge>({
  usuario: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  codigoHash: { type: String, required: true },
  nuevaPasswordHash: { type: String, required: true },
  intentos: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, expires: 0 }, // TTL: auto-delete al expirar
});

export default model<IPasswordChangeChallenge>('PasswordChangeChallenge', passwordChangeChallengeSchema);
