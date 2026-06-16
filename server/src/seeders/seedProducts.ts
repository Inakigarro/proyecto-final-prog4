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
// Productos y URLs de imagen tomados de DummyJSON Products (cdn.dummyjson.com)
// que provee imágenes reales y estables para productos de e-commerce demo.
// Categorías elegidas: las cinco que DummyJSON cubre con cobertura completa
// (laptops, smartphones, tablets, mobile-accessories y mens-watches).
//
// Las descripciones están traducidas al español manualmente para mantener
// la coherencia idiomática del sitio.
//
// Orden interno:
//  1. Crea/actualiza las categorías vacías (con validateBeforeSave: false
//     porque el modelo Categoria exige al menos 1 item).
//  2. Crea/actualiza los items asociándoles su categoría.
//  3. Actualiza cada categoría con la lista final de items.
// ─────────────────────────────────────────────────────────────────────────────

interface ItemSeed {
  nombre: string;
  descripcion: string;
  imagen: string;
  precioUnitario: number;
  stock: number;
}

/**
 * Construye la URL del thumbnail de DummyJSON para un producto dado.
 * Patrón: https://cdn.dummyjson.com/products/images/{categoria}/{Nombre}/thumbnail.png
 *
 * @param categoria - Slug de la categoría en DummyJSON (ej. 'laptops').
 * @param nombre - Nombre exacto del producto tal como aparece en DummyJSON.
 */
function urlDummyJson(categoria: string, nombre: string): string {
  return `https://cdn.dummyjson.com/products/images/${categoria}/${encodeURIComponent(nombre)}/thumbnail.png`;
}

/**
 * Catálogo declarativo: lista de categorías y los items que pertenecen a cada una.
 * Para agregar productos nuevos solo hay que extender los arrays de items.
 */
const CATALOGO: { categoria: string; items: ItemSeed[] }[] = [
  {
    categoria: 'Notebooks',
    items: [
      {
        nombre: 'Apple MacBook Pro 14 Inch Space Grey',
        descripcion:
          'Notebook profesional con pantalla mini-LED de 14 pulgadas, chip Apple Silicon y autonomía extendida. Ideal para desarrollo, edición de video y diseño.',
        imagen: urlDummyJson('laptops', 'Apple MacBook Pro 14 Inch Space Grey'),
        precioUnitario: 2150000,
        stock: 3,
      },
      {
        nombre: 'Asus Zenbook Pro Duo 15',
        descripcion:
          'Notebook con segunda pantalla ScreenPad Plus de 14 pulgadas, GPU dedicada y construcción premium. Pensada para creadores de contenido y multitarea profesional.',
        imagen: urlDummyJson('laptops', 'Asus Zenbook Pro Duo 15'),
        precioUnitario: 1500000,
        stock: 5,
      },
      {
        nombre: 'Huawei Matebook X Pro',
        descripcion:
          'Ultrabook con pantalla 3K táctil de 13.9 pulgadas y procesador Intel Core de última generación. Chasis de aluminio y peso ultraliviano.',
        imagen: urlDummyJson('laptops', 'Huawei Matebook X Pro'),
        precioUnitario: 1200000,
        stock: 7,
      },
      {
        nombre: 'Lenovo ThinkPad X1',
        descripcion:
          'Notebook empresarial con teclado ThinkPad, lector de huellas, certificación MIL-SPEC y conectividad LTE. Para uso corporativo intenso en movilidad.',
        imagen: urlDummyJson('laptops', 'Lenovo Thinkpad X1'),
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
        imagen: urlDummyJson('smartphones', 'iPhone 15 Pro Max'),
        precioUnitario: 1950000,
        stock: 4,
      },
      {
        nombre: 'Samsung Galaxy S24 Ultra 5G',
        descripcion:
          'Pantalla Dynamic AMOLED 2X de 6.8 pulgadas, cámara principal de 200MP, S Pen integrado y procesador Snapdragon 8 Gen 3 for Galaxy.',
        imagen: urlDummyJson('smartphones', 'Samsung Galaxy S24 Ultra 5G'),
        precioUnitario: 1750000,
        stock: 6,
      },
      {
        nombre: 'OnePlus 12R',
        descripcion:
          'Pantalla AMOLED 120Hz, batería de 5500mAh con carga SUPERVOOC de 100W y procesador Snapdragon 8 Gen 2. Diseño premium a precio accesible.',
        imagen: urlDummyJson('smartphones', 'OnePlus 12R'),
        precioUnitario: 620000,
        stock: 10,
      },
      {
        nombre: 'Realme C53',
        descripcion:
          'Pantalla de 6.74 pulgadas a 90Hz, cámara de 50MP y acabado dorado tipo "Champion". Excelente relación precio-calidad para uso diario.',
        imagen: urlDummyJson('smartphones', 'Realme C53'),
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
        imagen: urlDummyJson('tablets', 'iPad Mini 2021 Starlight'),
        precioUnitario: 850000,
        stock: 8,
      },
      {
        nombre: 'Samsung Galaxy Tab S8 Plus',
        descripcion:
          'Tablet Android con pantalla Super AMOLED de 12.4 pulgadas, S Pen incluido y procesador Snapdragon 8 Gen 1. Ideal para productividad y entretenimiento.',
        imagen: urlDummyJson('tablets', 'Samsung Galaxy Tab S8 Plus'),
        precioUnitario: 1100000,
        stock: 5,
      },
      {
        nombre: 'Huawei MatePad Pro',
        descripcion:
          'Pantalla OLED de 12.6 pulgadas, sonido cuádruple Harman Kardon y compatibilidad con M-Pencil. Excelente para diseño y consumo multimedia.',
        imagen: urlDummyJson('tablets', 'Huawei MatePad Pro'),
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
        imagen: urlDummyJson('mobile-accessories', 'Apple AirPods Pro'),
        precioUnitario: 385000,
        stock: 15,
      },
      {
        nombre: 'Apple Airpods Max Silver',
        descripcion:
          'Auriculares supraurales premium con cancelación activa de ruido, modo Transparencia y audio espacial dinámico con seguimiento de cabeza.',
        imagen: urlDummyJson('mobile-accessories', 'Apple Airpods Max Silver'),
        precioUnitario: 890000,
        stock: 4,
      },
      {
        nombre: 'Apple Magic Mouse',
        descripcion:
          'Mouse inalámbrico con superficie multitouch para gestos. Conexión Bluetooth, base recargable y diseño ergonómico para uso prolongado.',
        imagen: urlDummyJson('mobile-accessories', 'Apple Magic Mouse'),
        precioUnitario: 145000,
        stock: 12,
      },
      {
        nombre: 'Apple Wireless Charger',
        descripcion:
          'Base de carga inalámbrica compatible con iPhone, AirPods y dispositivos Qi. Carga rápida hasta 15W y diseño minimalista.',
        imagen: urlDummyJson('mobile-accessories', 'Apple Wireless Charger'),
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
        imagen: urlDummyJson('mens-watches', 'Rolex Cellini Date'),
        precioUnitario: 4500000,
        stock: 1,
      },
      {
        nombre: 'Longines Master Collection',
        descripcion:
          'Reloj suizo de la Master Collection con esfera blanca, agujas dauphine y movimiento automático L888 con reserva de marcha de 64 horas.',
        imagen: urlDummyJson('mens-watches', 'Longines Master Collection'),
        precioUnitario: 1250000,
        stock: 3,
      },
      {
        nombre: 'Brown Leather Belt Watch',
        descripcion:
          'Reloj clásico con correa de cuero marrón, esfera analógica blanca y caja de acero inoxidable de 40mm. Diseño atemporal para uso diario.',
        imagen: urlDummyJson('mens-watches', 'Brown Leather Belt Watch'),
        precioUnitario: 180000,
        stock: 8,
      },
    ],
  },
];

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

    // 2. Upsert de cada item del grupo, ya con la categoría asignada.
    const idsItems: Types.ObjectId[] = [];
    for (const datosItem of grupo.items) {
      const item = await upsertItem(datosItem, categoria._id);
      idsItems.push(item._id);
      itemsSincronizados++;
    }

    // 3. Actualizamos la categoría con la lista final de items.
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
  datos: ItemSeed,
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
