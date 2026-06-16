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
import orderRoutes from './routes/orderRoutes';
import slideRoutes from './routes/slideRoutes';

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
  // express.json() con límite generoso porque el endpoint POST /api/slides
  // recibe el data URI base64 de la imagen en el body (hasta ~6.7MB con
  // overhead para un archivo original de 5MB).
  app.use(express.json({ limit: '10mb' }));

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
  app.use('/api/orders',      orderRoutes);
  app.use('/api/slides',      slideRoutes);

  app.use((_req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
  });
  app.use(errorHandler);

  return app;
}
