import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import Category, { ICategory } from '../models/Category';
import Item, { IItem } from '../models/Item';
import { logger } from '../config/logger';

// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO TECNOLÓGICO
// Idempotente: usa upsert tanto en categorías como en items.
// Se puede correr múltiples veces sin duplicar datos.
//
// Fuente: DummyJSON Products (https://dummyjson.com/products). El seeder hace
// HTTP GET por cada categoría tech relevante y persiste TODOS los productos
// que el API devuelva, usando sus URLs de thumbnail reales. Las descripciones
// se generan en español a partir del título y la marca para mantener la
// coherencia idiomática del sitio. Los precios se convierten de USD a ARS
// con una tasa fija.
//
// Limpieza previa: ANTES de cargar el catálogo nuevo, todos los Items y
// Categories preexistentes se marcan como inactivos (soft delete). Las
// referencias históricas (órdenes de compra, promociones) no se rompen
// porque los documentos siguen existiendo en la BD. Los items y categorías
// que estén en el catálogo nuevo de DummyJSON se reactivan en el upsert.
//
// Orden interno:
//  1. Soft delete: desactiva todos los Items y Categories existentes.
//  2. Fetch en paralelo de las 5 categorías de DummyJSON.
//  3. Upsert de las categorías (con validateBeforeSave: false porque el
//     modelo Categoria exige al menos 1 item).
//  4. Upsert de cada item, asociándolo a su categoría.
//  5. Actualiza cada categoría con la lista final de items.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_DUMMYJSON = 'https://dummyjson.com';

/** Tasa fija USD → ARS para convertir los precios del API. */
const TASA_USD_ARS = 1500;

/**
 * Mapa de categorías DummyJSON → nombre de display en español.
 * Solo incluye las categorías tech relevantes para TechPoint.
 */
const CATEGORIAS_DUMMYJSON: { slug: string; nombre: string }[] = [
  { slug: 'laptops', nombre: 'Notebooks' },
  { slug: 'smartphones', nombre: 'Smartphones' },
  { slug: 'tablets', nombre: 'Tablets' },
  { slug: 'mobile-accessories', nombre: 'Accesorios móviles' },
  { slug: 'mens-watches', nombre: 'Relojes hombre' },
  { slug: 'womens-watches', nombre: 'Relojes mujer' },
];

interface ProductoDummyJson {
  id: number;
  title: string;
  brand?: string;
  price: number;
  stock: number;
  thumbnail: string;
}

interface RespuestaDummyJson {
  products: ProductoDummyJson[];
  total: number;
}

/**
 * Trae todos los productos de una categoría de DummyJSON.
 * Si el API responde con error, devuelve un array vacío y loggea el problema.
 */
async function obtenerProductosCategoria(slug: string): Promise<ProductoDummyJson[]> {
  try {
    const url = `${BASE_DUMMYJSON}/products/category/${slug}?limit=100`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) {
      throw new Error(`DummyJSON respondió ${respuesta.status}`);
    }
    const data = (await respuesta.json()) as RespuestaDummyJson;
    return data.products ?? [];
  } catch (error) {
    logger.error('No se pudo obtener categoría de DummyJSON', {
      slug,
      error: String(error),
    });
    return [];
  }
}

/**
 * Genera una descripción corta en español según la categoría del producto.
 * Incluye la marca cuando está disponible para que el texto sea más concreto.
 */
function generarDescripcion(categoria: string, brand?: string): string {
  const marca = brand?.trim() ? `${brand.trim()} ` : '';
  switch (categoria) {
    case 'Notebooks':
      return `Notebook ${marca}con prestaciones modernas, ideal para uso profesional, estudio o entretenimiento. Diseño elegante y construcción premium.`;
    case 'Smartphones':
      return `Smartphone ${marca}con pantalla de alta resolución, cámara avanzada y rendimiento fluido para uso diario.`;
    case 'Tablets':
      return `Tablet ${marca}con pantalla amplia y procesador potente. Ideal para productividad, lectura y consumo multimedia.`;
    case 'Accesorios móviles':
      return `Accesorio ${marca}compatible con dispositivos móviles. Calidad premium y diseño práctico para uso cotidiano.`;
    case 'Relojes hombre':
    case 'Relojes mujer':
      return `Reloj ${marca}con diseño atemporal y mecanismo de precisión. Acabados de alta gama y materiales nobles.`;
    default:
      return `Producto ${marca}de calidad premium.`;
  }
}

/**
 * Convierte el precio del API (USD) al precio del catálogo (ARS) redondeado.
 */
function convertirPrecio(usd: number): number {
  return Math.round(usd * TASA_USD_ARS);
}

/**
 * Punto de entrada del seeder.
 */
async function seed(): Promise<void> {
  await mongoose.connect(process.env.MONGODB_URI as string);
  logger.info('Conectado a MongoDB');

  // 1. Soft delete del catálogo preexistente. Los items y categorías que
  //    estén en el catálogo nuevo de DummyJSON se reactivan en el upsert.
  await desactivarCatalogoExistente();

  // 2. Fetch en paralelo de las 5 categorías.
  const respuestas = await Promise.all(
    CATEGORIAS_DUMMYJSON.map(async ({ slug, nombre }) => ({
      nombreCategoria: nombre,
      productos: await obtenerProductosCategoria(slug),
    })),
  );

  let categoriasSincronizadas = 0;
  let itemsSincronizados = 0;

  for (const { nombreCategoria, productos } of respuestas) {
    if (productos.length === 0) {
      logger.warn('Categoría sin productos, se omite', { categoria: nombreCategoria });
      continue;
    }

    // 3. Upsert de la categoría vacía (la reactiva si estaba inactiva).
    const categoria = await upsertCategoriaVacia(nombreCategoria);

    // 4. Upsert de cada item del grupo, ya con la categoría asignada.
    const idsItems: Types.ObjectId[] = [];
    for (const producto of productos) {
      const item = await upsertItem(producto, nombreCategoria, categoria._id);
      idsItems.push(item._id);
      itemsSincronizados++;
    }

    // 5. Actualizamos la categoría con la lista final de items.
    categoria.items = idsItems;
    await categoria.save();

    categoriasSincronizadas++;
    logger.info('✓ Categoría sincronizada', {
      categoria: nombreCategoria,
      items: idsItems.length,
    });
  }

  logger.info('✓ Seeder finalizado', {
    categorias: categoriasSincronizadas,
    items: itemsSincronizados,
  });
  await mongoose.disconnect();
}

/**
 * Marca como inactivos todos los Items y Categories existentes en la BD.
 * Es un soft delete que conserva las referencias históricas (órdenes,
 * promociones) y permite que el upsert posterior reactive los que están
 * en el catálogo nuevo.
 */
async function desactivarCatalogoExistente(): Promise<void> {
  const [itemsResult, categoriesResult] = await Promise.all([
    Item.updateMany({ activo: { $ne: false } }, { activo: false }),
    Category.updateMany({ activo: { $ne: false } }, { activo: false }),
  ]);
  logger.info('Catálogo existente desactivado (soft delete)', {
    itemsDesactivados: itemsResult.modifiedCount,
    categoriasDesactivadas: categoriesResult.modifiedCount,
  });
}

/**
 * Crea o reactiva una categoría por nombre, sin requerir items.
 * Si la categoría existía (incluso desactivada por el soft delete previo),
 * la reactiva. Usa validateBeforeSave:false para esquivar la validación de
 * "mínimo 1 item", que se cumplirá recién cuando agreguemos los items en
 * el paso siguiente.
 */
async function upsertCategoriaVacia(nombre: string): Promise<ICategory> {
  const existente = await Category.findOne({ nombre });
  if (existente) {
    existente.activo = true;
    await existente.save({ validateBeforeSave: false });
    return existente;
  }
  const nueva = new Category({ nombre, items: [], activo: true });
  await nueva.save({ validateBeforeSave: false });
  return nueva;
}

/**
 * Crea o actualiza un item por nombre, asignándole su categoría.
 * Mapea los campos de DummyJSON al schema del proyecto. Si el item ya existía
 * (incluso desactivado por el soft delete previo), lo reactiva y actualiza
 * todos los campos para reflejar cambios del catálogo remoto.
 */
async function upsertItem(
  producto: ProductoDummyJson,
  nombreCategoria: string,
  categoriaId: Types.ObjectId,
): Promise<IItem> {
  const item = await Item.findOneAndUpdate(
    { nombre: producto.title },
    {
      nombre: producto.title,
      descripcion: generarDescripcion(nombreCategoria, producto.brand),
      imagen: producto.thumbnail,
      precioUnitario: convertirPrecio(producto.price),
      stock: producto.stock,
      category: [categoriaId],
      activo: true,
    },
    { upsert: true, new: true, runValidators: true },
  );
  return item as IItem;
}

seed().catch((error) => {
  logger.error('Error en el seeder', { error: String(error) });
  process.exit(1);
});
