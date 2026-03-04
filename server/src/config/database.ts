import mongoose from 'mongoose';

/** Establece la conexión con MongoDB usando la URI del archivo .env */
export const conectarDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI as string;
  await mongoose.connect(uri);
  console.log('Conectado a MongoDB');
};
