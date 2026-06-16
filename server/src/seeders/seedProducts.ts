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
// La URL de imagen NO está hardcodeada en este archivo: el seeder hace HTTP GET
// a DummyJSON Products al arrancar y toma la URL del thumbnail oficial del
// producto. Eso garantiza que los links siempre apunten a una imagen válida
// (sin depender de que el patrón de URL del CDN cambie). Si DummyJSON está
// caído o no encuentra el producto, se usa placehold.co como fallback para
// que la app siga renderizando sin imágenes rotas.
//
// Las descripciones están traducidas al español y los precios en ARS para
// mantener la coherencia del sitio.
//
// Orden interno:
//  1. Resuelve la URL de imagen de cada item consultando DummyJSON.
//  2. Crea/actualiza las categorías vacías (con validateBeforeSave: false
//     porque el modelo Categoria exige al menos 1 item).
//  3. Crea/actualiza los items asociándoles su categoría.
//  4. Actualiza cada categoría con la lista final de items.
// ─────────────────────────────────────────────────────────────────────────────

interface ItemSeed {
  /** Nombre tal como aparece en DummyJSON; se usa también como query de búsqueda. */
  nombre: string;
  descripcion: string;
  precioUnitario: number;
  stock: number;
}

const BASE_DUMMYJSON = 'https://dummyjson.com';

/**
 * Catálogo declarativo. Para agregar productos nuevos solo hay que extender
 * los arrays de items con el nombre exacto del producto en DummyJSON.
 */
const CATALOGO: { categoria: string; items: ItemSeed[] }[] = [
  {
    categoria: 'Notebooks',
    items: [
      {
        nombre: 'Apple MacBook Pro 14 Inch Space Grey',
        descripcion:
          'Notebook profesional con pantalla mini-LED de 14 pulgadas, chip Apple Silicon y autonomía extendida. Ideal para desarrollo, edición de video y diseño.',
        precioUnitario: 2150000,
        stock: 3,
      },
      {
        nombre: 'Asus Zenbook Pro Duo 15',
        descripcion:
          'Notebook con segunda pantalla ScreenPad Plus de 14 pulgadas, GPU dedicada y construcción premium. Pensada para creadores de contenido y multitarea profesional.',
        precioUnitario: 1500000,
        stock: 5,
      },
      {
        nombre: 'Huawei Matebook X Pro',
        descripcion:
          'Ultrabook con pantalla 3K táctil de 13.9 pulgadas y procesador Intel Core de última generación. Chasis de aluminio y peso ultraliviano.',
        precioUnitario: 1200000,
        stock: 7,
      },
      {
        nombre: 'Lenovo Thinkpad X1',
        descripcion:
          'Notebook empresarial con teclado ThinkPad, lector de huellas, certificación MIL-SPEC y conectividad LTE. Para uso corporativo intenso en movilidad.',
        precioUnitario: 1400000,
        stock: 6,
      },
    ],
  },
  {
    categoria: 'Smartphones',
    items: [
      {
        nombre: 'iPhone 15 Pro Max',
        descripcion:
          'Tope de gama con chip A17 Pro, cámara de 48MP con teleobjetivo de zoom óptico 5x, construcción en titanio y conexión USB-C.',
        precioUnitario: 1950000,
        stock: 4,
      },
      {
        nombre: 'Samsung Galaxy S24 Ultra 5G',
        descripcion:
          'Pantalla Dynamic AMOLED 2X de 6.8 pulgadas, cámara principal de 200MP, S Pen integrado y procesador Snapdragon 8 Gen 3 for Galaxy.',
        precioUnitario: 1750000,
        stock: 6,
      },
      {
        nombre: 'OnePlus 12R',
        descripcion:
          'Pantalla AMOLED 120Hz, batería de 5500mAh con carga SUPERVOOC de 100W y procesador Snapdragon 8 Gen 2. Diseño premium a precio accesible.',
        precioUnitario: 620000,
        stock: 10,
      },
      {
        nombre: 'Realme C53',
        descripcion:
          'Pantalla de 6.74 pulgadas a 90Hz, cámara de 50MP y acabado dorado tipo "Champion". Excelente relación precio-calidad para uso diario.',
        precioUnitario: 250000,
        stock: 18,
      },
    ],
  },
  {
    categoria: 'Tablets',
    items: [
      {
        nombre: 'iPad Mini 2021 Starlight',
        descripcion:
          'Tablet compacta con chip A15 Bionic, pantalla Liquid Retina de 8.3 pulgadas y soporte para Apple Pencil de segunda generación.',
        precioUnitario: 850000,
        stock: 8,
      },
      {
        nombre: 'Samsung Galaxy Tab S8 Plus',
        descripcion:
          'Tablet Android con pantalla Super AMOLED de 12.4 pulgadas, S Pen incluido y procesador Snapdragon 8 Gen 1. Ideal para productividad y entretenimiento.',
        precioUnitario: 1100000,
        stock: 5,
      },
      {
        nombre: 'Huawei MatePad Pro',
        descripcion:
          'Pantalla OLED de 12.6 pulgadas, sonido cuádruple Harman Kardon y compatibilidad con M-Pencil. Excelente para diseño y consumo multimedia.',
        precioUnitario: 950000,
        stock: 6,
      },
    ],
  },
  {
    categoria: 'Accesorios móviles',
    items: [
      {
        nombre: 'Apple AirPods Pro',
        descripcion:
          'Auriculares in-ear inalámbricos con cancelación activa de ruido, audio espacial personalizado y estuche de carga MagSafe.',
        precioUnitario: 385000,
        stock: 15,
      },
      {
        nombre: 'Apple Airpods Max Silver',
        descripcion:
          'Auriculares supraurales premium con cancelación activa de ruido, modo Transparencia y audio espacial dinámico con seguimiento de cabeza.',
        precioUnitario: 890000,
        stock: 4,
      },
      {
        nombre: 'Apple Magic Mouse',
        descripcion:
          'Mouse inalámbrico con superficie multitouch para gestos. Conexión Bluetooth, base recargable y diseño ergonómico para uso prolongado.',
        precioUnitario: 145000,
        stock: 12,
      },
      {
        nombre: 'Apple Wireless Charger',
        descripcion:
          'Base de carga inalámbrica compatible con iPhone, AirPods y dispositivos Qi. Carga rápida hasta 15W y diseño minimalista.',
        precioUnitario: 65000,
        stock: 25,
      },
    ],
  },
  {
    categoria: 'Relojes',
    items: [
      {
        nombre: 'Rolex Cellini Date',
        descripcion:
          'Reloj de lujo con caja de oro blanco de 39mm, esfera negra con fecha y correa de cuero. Movimiento automático certificado COSC.',
        precioUnitario: 4500000,
        stock: 1,
      },
      {
        nombre: 'Longines Master Collection',
        descripcion:
          'Reloj suizo de la Master Collection con esfera blanca, agujas dauphine y movimiento automático L888 con reserva de marcha de 64 horas.',
        precioUnitario: 1250000,
        stock: 3,
      },
      {
        nombre: 'Brown Leather Belt Watch',
        descripcion:
          'Reloj clásico con correa de cuero marrón, esfera analógica blanca y caja de acero inoxidable de 40mm. Diseño atemporal para uso diario.',
        precioUnitario: 180000,
        stock: 8,
      },
    ],
  },
];

interface ProductoDummyJson {
  id: number;
  title: string;
  thumbnail: string;
}

/**
 * Resuelve la URL del thumbnail de DummyJSON para un producto buscando por su
 * nombre exacto. Si no hay match o el endpoint falla, devuelve una URL de
 * placehold.co con la paleta del proyecto y el nombre del producto en el
 * cartel para que la app siga viéndose presentable.
 */
async function resolverUrlImagen(nombre: string): Promise<string> {
  try {
    const url = `${BASE_DUMMYJSON}/products/search?q=${encodeURIComponent(nombre)}&limit=5`;
    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error(`DummyJSON respondió ${respuesta.status}`);

    const data = (await respuesta.json()) as { products: ProductoDummyJson[] };
    const match = data.products.find((p) => p.title.toLowerCase() === nombre.toLowerCase())
      ?? data.products[0];
    if (match?.thumbnail) return match.thumbnail;

    throw new Error('Sin coincidencias');
  } catch (error) {
    logger.warn('Fallback a placeholder', { producto: nombre, error: String(error) });
    const texto = encodeURIComponent(nombre);
    return `https://placehold.co/600x600/1c2826/cc9476/png?text=${texto}`;
  }
}

/**
 * Punto de entrada del seeder.
 */
async function seed(): Promise<void> {
  await mongoose.connect(process.env.MONGODB_URI as string);
  logger.info('Conectado a MongoDB');

  let categoriasSincronizadas = 0;
  let itemsSincronizados = 0;

  for (const grupo of CATALOGO) {
    // 1. Upsert de la categoría vacía. Salteamos validaciones porque el
    //    schema exige >=1 item, y todavía no creamos los items.
    const categoria = await upsertCategoriaVacia(grupo.categoria);

    // 2. Resolvemos las URLs de DummyJSON en paralelo para acelerar el seed.
    const itemsConImagen = await Promise.all(
      grupo.items.map(async (item) => ({
        ...item,
        imagen: await resolverUrlImagen(item.nombre),
      })),
    );

    // 3. Upsert de cada item del grupo, ya con la categoría asignada.
    const idsItems: Types.ObjectId[] = [];
    for (const datosItem of itemsConImagen) {
      const item = await upsertItem(datosItem, categoria._id);
      idsItems.push(item._id);
      itemsSincronizados++;
    }

    // 4. Actualizamos la categoría con la lista final de items.
    categoria.items = idsItems;
    await categoria.save();

    categoriasSincronizadas++;
    logger.info(`✓ Categoría sincronizada`, { categoria: grupo.categoria, items: idsItems.length });
  }

  logger.info(`✓ Seeder finalizado`, { categorias: categoriasSincronizadas, items: itemsSincronizados });
  await mongoose.disconnect();
}

/**
 * Crea o actualiza una categoría por nombre, sin requerir items.
 * Usa validateBeforeSave:false para esquivar la validación de "mínimo 1 item",
 * que se cumplirá recién cuando agreguemos los items en el paso siguiente.
 */
async function upsertCategoriaVacia(nombre: string): Promise<ICategory> {
  const existente = await Category.findOne({ nombre });
  if (existente) {
    return existente;
  }
  const nueva = new Category({ nombre, items: [] });
  await nueva.save({ validateBeforeSave: false });
  return nueva;
}

/**
 * Crea o actualiza un item por nombre, asignándole su categoría.
 * Si el item ya existe, actualiza precio, stock, descripción e imagen para
 * reflejar cambios declarados en el catálogo sin perder el _id ni las
 * referencias en órdenes.
 */
async function upsertItem(
  datos: ItemSeed & { imagen: string },
  categoriaId: Types.ObjectId
): Promise<IItem> {
  const item = await Item.findOneAndUpdate(
    { nombre: datos.nombre },
    {
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      imagen: datos.imagen,
      precioUnitario: datos.precioUnitario,
      stock: datos.stock,
      category: [categoriaId],
    },
    { upsert: true, new: true, runValidators: true }
  );
  return item as IItem;
}

seed().catch((error) => {
  logger.error('Error en el seeder', { error: String(error) });
  process.exit(1);
});
