import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import roleRoutes from './routes/roleRoutes';
import userRoutes from './routes/userRoutes';
import permissionRoutes from './routes/permissionRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import cartRoutes from './routes/cartRoutes';
import promotionRoutes from './routes/promotionRoutes';
import addressRoutes from './routes/addressRoutes';

/**
 * Crea y configura la aplicación Express.
 * Separado de index.ts para poder importarla en tests sin disparar
 * la conexión a la BD ni la validación de variables de entorno.
 */
export function crearApp() {
  const app = express();

  app.use(cors({
    origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  }));
  app.use(helmet());
  app.use(express.json());

  app.get('/api', (_req, res) => {
    res.send('¡Bienvenido a la API de gestión de usuarios, roles y permisos!');
  });

  app.use('/api/auth',        authRoutes);
  app.use('/api/permissions', permissionRoutes);
  app.use('/api/roles',       roleRoutes);
  app.use('/api/users',       userRoutes);
  app.use('/api/products',    productRoutes);
  app.use('/api/categories',  categoryRoutes);
  app.use('/api/cart',        cartRoutes);
  app.use('/api/promotions',  promotionRoutes);
  app.use('/api/addresses',   addressRoutes);

  app.use((_req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
  });
  app.use(errorHandler);

  return app;
}
