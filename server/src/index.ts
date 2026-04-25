import 'dotenv/config';
import express from 'express';
import { conectarDB } from './config/database';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import roleRoutes from './routes/roleRoutes';
import userRoutes from './routes/userRoutes';
import permissionRoutes from './routes/permissionRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
const app = express();
const PORT = process.env.PORT ?? 3000;

// Parsea el body de los requests como JSON
app.use(express.json());

app.get('/api', (req, res) => {
  res.send('¡Bienvenido a la API de gestión de usuarios, roles y permisos!');
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Manejo global de errores (debe ir al final)
app.use(errorHandler);

// Conecta a la BD y luego inicia el servidor
conectarDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('Error al conectar a MongoDB:', error);
    process.exit(1);
  });