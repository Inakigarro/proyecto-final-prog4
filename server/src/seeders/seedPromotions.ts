import 'dotenv/config';
import mongoose from 'mongoose';
import Item from '../models/Item';
import Promotion, { TipoPromocion, IParametrosPromocion } from '../models/Promotion';
import { logger } from '../config/logger';

// ─────────────────────────────────────────────────────────────────────────────
// SEED DE PROMOCIONES
// Idempotente: upsert por `nombre` de promoción.
// Depende de productos existentes — correr antes `npm run seed:products`.
// ─────────────────────────────────────────────────────────────────────────────

interface PromocionSeed {
  nombre: string;
  tipo: TipoPromocion;
  parametros: IParametrosPromocion;
  /**
   * Rango disjunto sobre el array de productos activos.
   * Las cuatro promos toman tramos consecutivos para no solapar
   * y que se pueda probar cada cucarda en aislado.
   */
  desdeIndice: number;
  cantidad: number;
}

const PROMOCIONES_SEED: PromocionSeed[] = [
  {
    nombre: 'Black Week: 15% OFF en seleccionados',
    tipo: 'DESCUENTO_PORCENTUAL',
    parametros: { porcentaje: 15 },
    desdeIndice: 0,
    cantidad: 3,
  },
  {
    nombre: 'Llevá 3, pagá 2 en accesorios',
    tipo: 'NXM',
    parametros: { cantidadLleva: 3, cantidadPaga: 2 },
    desdeIndice: 3,
    cantidad: 2,
  },
  {
    nombre: '2da unidad al 50%',
    tipo: 'SEGUNDA_UNIDAD',
    parametros: { descuentoSegundaUnidad: 50 },
    desdeIndice: 5,
    cantidad: 2,
  },
  {
    nombre: 'Cyber Tech: 25% OFF',
    tipo: 'DESCUENTO_PORCENTUAL',
    parametros: { porcentaje: 25 },
    desdeIndice: 7,
    cantidad: 3,
  },
];

async function ejecutarSeedPromociones() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI no configurada');

    await mongoose.connect(uri);
    logger.info('Conectado a MongoDB para seed de promociones');

    const productosActivos = await Item.find({ activo: { $ne: false } })
      .select('_id')
      .lean();

    if (productosActivos.length === 0) {
      logger.warn(
        'No hay productos activos en la BD. Correr primero `npm run seed:products`.',
      );
      return;
    }

    for (const promoSeed of PROMOCIONES_SEED) {
      const idsAAsociar = productosActivos
        .slice(promoSeed.desdeIndice, promoSeed.desdeIndice + promoSeed.cantidad)
        .map((producto) => producto._id);

      await Promotion.findOneAndUpdate(
        { nombre: promoSeed.nombre },
        {
          nombre: promoSeed.nombre,
          tipo: promoSeed.tipo,
          parametros: promoSeed.parametros,
          productos: idsAAsociar,
          activo: true,
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
      );

      logger.info('Promoción sembrada', {
        nombre: promoSeed.nombre,
        productosAsociados: idsAAsociar.length,
      });
    }

    logger.info('Seed de promociones finalizado correctamente');
  } catch (error) {
    logger.error('Error en el seed de promociones', { error: String(error) });
  } finally {
    await mongoose.disconnect();
  }
}

ejecutarSeedPromociones();
