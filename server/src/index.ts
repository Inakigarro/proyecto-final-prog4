import 'dotenv/config';
import { validarEnv } from './config/env';
import { conectarDB } from './config/database';
import { logger } from './config/logger';
import { crearApp } from './app';

validarEnv();

const app = crearApp();
const PORT = process.env.PORT ?? 3000;

conectarDB()
  .then(() => {
    app.listen(PORT, () => logger.info('Servidor iniciado', { puerto: PORT }));
  })
  .catch((error) => {
    logger.error('Error al conectar a MongoDB', { error: String(error) });
    process.exit(1);
  });
