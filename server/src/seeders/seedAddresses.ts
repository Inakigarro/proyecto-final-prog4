import 'dotenv/config';
import mongoose from 'mongoose';
import Address from '../models/Address';
import User from '../models/User';
import { logger } from '../config/logger';

// ─────────────────────────────────────────────────────────────────────────────
// SEED DE DIRECCIONES DE EJEMPLO
// Carga un par de direcciones para el SuperAdmin si todavía no tiene.
// Es idempotente: si el usuario ya tiene alguna dirección activa, no hace nada.
// Sirve para probar la UI de "Mis direcciones" del perfil.
// ─────────────────────────────────────────────────────────────────────────────

const SUPERADMIN_EMAIL = 'superadmin@app.com';

/** Direcciones de muestra a cargar para el usuario semilla */
const DIRECCIONES_EJEMPLO = [
  {
    calle: 'Av. Corrientes',
    numero: '1234',
    piso: '5',
    departamento: 'B',
    ciudad: 'CABA',
    provincia: 'Buenos Aires',
    codigoPostal: '1043',
  },
  {
    calle: 'San Martín',
    numero: '450',
    ciudad: 'Mendoza',
    provincia: 'Mendoza',
    codigoPostal: '5500',
  },
  {
    calle: 'Belgrano',
    numero: '880',
    piso: '2',
    ciudad: 'Rosario',
    provincia: 'Santa Fe',
    codigoPostal: '2000',
  },
];

async function seedAddresses(): Promise<void> {
  await mongoose.connect(process.env.MONGODB_URI as string);
  logger.info('Conectado a MongoDB');

  const usuario = await User.findOne({ email: SUPERADMIN_EMAIL });
  if (!usuario) {
    logger.warn(`Usuario semilla no encontrado, abortando seed de direcciones`, { email: SUPERADMIN_EMAIL });
    await mongoose.disconnect();
    return;
  }

  // Idempotencia: si ya tiene direcciones activas no se inserta nada
  const yaTiene = await Address.countDocuments({ usuario: usuario._id, activo: { $ne: false } });
  if (yaTiene > 0) {
    logger.info(`Usuario ya tiene direcciones cargadas, no se hace nada`, { email: SUPERADMIN_EMAIL, cantidad: yaTiene });
    await mongoose.disconnect();
    return;
  }

  // Inserta cada dirección con el usuario asociado
  await Address.insertMany(
    DIRECCIONES_EJEMPLO.map((direccion) => ({ ...direccion, usuario: usuario._id }))
  );
  logger.info(`✓ ${DIRECCIONES_EJEMPLO.length} direcciones sembradas para el usuario`, { email: SUPERADMIN_EMAIL });

  await mongoose.disconnect();
  logger.info('Seeder de direcciones finalizado');
}

seedAddresses().catch((error) => {
  logger.error('Error en el seeder de direcciones', { error: String(error) });
  process.exit(1);
});
