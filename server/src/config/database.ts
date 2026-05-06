import mongoose from 'mongoose';
import { logger } from './logger';

/** Establece la conexión con MongoDB usando la URI del archivo .env */
export const conectarDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI no está definida en las variables de entorno');
  }
  await mongoose.connect(uri);
  logger.info('Conectado a MongoDB');
};
