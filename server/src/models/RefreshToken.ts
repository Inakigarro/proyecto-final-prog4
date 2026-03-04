import { Schema, model, Document, Types } from 'mongoose';

// Forma del documento RefreshToken en la base de datos
export interface IRefreshToken extends Document {
  token: string;
  usuario: Types.ObjectId;
  expiresAt: Date;
}

/**
 * Token de refresco asociado a un usuario.
 * Se usa para emitir nuevos access tokens sin pedir login nuevamente.
 * Al hacer logout, el token se elimina de la BD (revocación).
 */
const refreshTokenSchema = new Schema<IRefreshToken>({
  token: { type: String, required: true, unique: true },
  usuario: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // MongoDB elimina el documento automáticamente cuando vence
  expiresAt: { type: Date, required: true, expires: 0 },
});

export default model<IRefreshToken>('RefreshToken', refreshTokenSchema);
