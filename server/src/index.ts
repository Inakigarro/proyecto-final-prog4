import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { conectarDB } from './config/database';
import { logger } from './config/logger';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import roleRoutes from './routes/roleRoutes';
import userRoutes from './routes/userRoutes';
import permissionRoutes from './routes/permissionRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import cartRoutes from './routes/cartRoutes';

const app = express();
const PORT = process.env.PORT ?? 3000;

// CORS — en desarrollo permite el cliente Next.js en localhost:3000.
// En producción configurar ALLOWED_ORIGIN en las variables de entorno.
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000',
  credentials: true,
}));

// Headers de seguridad HTTP
app.use(helmet());

// Parsea el body de los requests como JSON
app.use(express.json());

app.get('/api', (_req, res) => {
  res.send('¡Bienvenido a la API de gestión de usuarios, roles y permisos!');
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);

// Handler para rutas no definidas
app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo global de errores (debe ir al final)
app.use(errorHandler);

// Conecta a la BD y luego inicia el servidor
conectarDB()
  .then(() => {
    app.listen(PORT, () => logger.info('Servidor iniciado', { puerto: PORT }));
  })
  .catch((error) => {
    logger.error('Error al conectar a MongoDB', { error: String(error) });
    process.exit(1);
  });
