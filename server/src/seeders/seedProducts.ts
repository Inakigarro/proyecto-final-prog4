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
// Las URLs de imagen son fotos públicas de Unsplash (estables, no requieren
// API key). Si alguna se cae, se puede reemplazar desde el dashboard sin
// necesidad de re-correr este seeder.
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
 * Catálogo declarativo: lista de categorías y los items que pertenecen a cada una.
 * Para agregar productos nuevos solo hay que extender los arrays de items.
 */
const CATALOGO: { categoria: string; items: ItemSeed[] }[] = [
  {
    categoria: 'Notebooks',
    items: [
      {
        nombre: 'MacBook Air M2',
        descripcion:
          'Liviana, potente y silenciosa. Chip M2 con CPU de 8 núcleos, 8GB de RAM y pantalla Liquid Retina de 13.6 pulgadas. Ideal para profesionales en movimiento.',
        imagen:
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop',
        precioUnitario: 2150000,
        stock: 3,
      },
      {
        nombre: 'Notebook Lenovo IdeaPad 3',
        descripcion:
          'Procesador Intel Core i5 de 11ª gen, 8GB RAM y 512GB SSD. Pantalla Full HD de 15.6 pulgadas. Perfecta para estudiar y trabajar desde casa.',
        imagen:
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop',
        precioUnitario: 850000,
        stock: 8,
      },
      {
        nombre: 'Notebook HP Pavilion 15',
        descripcion:
          'Notebook versátil con AMD Ryzen 5, 16GB RAM y 512GB SSD. Diseño elegante con teclado retroiluminado y pantalla antirreflejos.',
        imagen:
          'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop',
        precioUnitario: 1100000,
        stock: 5,
      },
      {
        nombre: 'Notebook Asus VivoBook 14',
        descripcion:
          'Compacta y portátil con Intel Core i7, 8GB RAM y 256GB SSD. NumberPad integrado en el touchpad para mayor productividad.',
        imagen:
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop',
        precioUnitario: 920000,
        stock: 6,
      },
    ],
  },
  {
    categoria: 'Smartphones',
    items: [
      {
        nombre: 'iPhone 15',
        descripcion:
          'Cámara dual de 48MP, chip A16 Bionic, USB-C, pantalla Super Retina XDR de 6.1 pulgadas. Disponible en cinco colores.',
        imagen:
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop',
        precioUnitario: 1750000,
        stock: 4,
      },
      {
        nombre: 'Samsung Galaxy A54',
        descripcion:
          'Cámara triple con sensor principal de 50MP, pantalla Super AMOLED de 6.4 pulgadas y batería de 5000mAh con carga rápida.',
        imagen:
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop',
        precioUnitario: 480000,
        stock: 12,
      },
      {
        nombre: 'Xiaomi Redmi Note 13',
        descripcion:
          'Cámara de 108MP, pantalla AMOLED de 120Hz, procesador Snapdragon 685 y carga rápida de 33W. Excelente relación precio-calidad.',
        imagen:
          'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&h=600&fit=crop',
        precioUnitario: 320000,
        stock: 15,
      },
      {
        nombre: 'Motorola Moto G84',
        descripcion:
          'Pantalla pOLED de 6.5 pulgadas a 120Hz, cámara de 50MP con OIS, 8GB de RAM y batería de 5000mAh.',
        imagen:
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop',
        precioUnitario: 360000,
        stock: 10,
      },
    ],
  },
  {
    categoria: 'Periféricos',
    items: [
      {
        nombre: 'Teclado mecánico Redragon Kumara',
        descripcion:
          'Teclado mecánico tenkeyless con switches outemu blue, retroiluminación RGB y construcción robusta. Ideal para gaming y oficina.',
        imagen:
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop',
        precioUnitario: 55000,
        stock: 20,
      },
      {
        nombre: 'Mouse Logitech G203',
        descripcion:
          'Mouse gamer con sensor de 8000 DPI, iluminación LIGHTSYNC RGB y 6 botones programables. Software G HUB incluido.',
        imagen:
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop',
        precioUnitario: 38000,
        stock: 25,
      },
      {
        nombre: 'Monitor LG 24" Full HD',
        descripcion:
          'Monitor IPS de 24 pulgadas, resolución 1920x1080, tasa de refresco de 75Hz y tecnología AMD FreeSync. Puertos HDMI y VGA.',
        imagen:
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop',
        precioUnitario: 270000,
        stock: 9,
      },
      {
        nombre: 'Webcam Logitech C920',
        descripcion:
          'Webcam Full HD 1080p con dos micrófonos estéreo y enfoque automático. Compatible con todas las plataformas de videollamadas.',
        imagen:
          'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&h=600&fit=crop',
        precioUnitario: 95000,
        stock: 14,
      },
    ],
  },
  {
    categoria: 'Audio',
    items: [
      {
        nombre: 'Auriculares Sony WH-CH520',
        descripcion:
          'Auriculares inalámbricos supraurales con hasta 50 horas de batería, conexión Bluetooth 5.2 y modo multi-punto. Cómodos para uso prolongado.',
        imagen:
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop',
        precioUnitario: 85000,
        stock: 18,
      },
      {
        nombre: 'Auriculares JBL Tune 510BT',
        descripcion:
          'Auriculares bluetooth con sonido Pure Bass, hasta 40 horas de autonomía y plegables para fácil transporte.',
        imagen:
          'https://images.unsplash.com/photo-1545127398-14699f92334b?w=600&h=600&fit=crop',
        precioUnitario: 65000,
        stock: 22,
      },
      {
        nombre: 'Parlante Bluetooth JBL Go 3',
        descripcion:
          'Parlante portátil bluetooth, resistente al agua y al polvo (IP67). Hasta 5 horas de reproducción y diseño compacto.',
        imagen:
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop',
        precioUnitario: 45000,
        stock: 30,
      },
      {
        nombre: 'Auriculares HyperX Cloud II',
        descripcion:
          'Auriculares gamer con sonido envolvente 7.1, almohadillas de memory foam y micrófono desmontable con cancelación de ruido.',
        imagen:
          'https://images.unsplash.com/photo-1599669454699-248893623440?w=600&h=600&fit=crop',
        precioUnitario: 145000,
        stock: 7,
      },
    ],
  },
  {
    categoria: 'Almacenamiento',
    items: [
      {
        nombre: 'SSD Kingston NV2 500GB',
        descripcion:
          'Unidad SSD NVMe PCIe Gen 4.0 con velocidades de hasta 3500 MB/s. Compatible con notebooks y PCs de escritorio modernos.',
        imagen:
          'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=600&fit=crop',
        precioUnitario: 58000,
        stock: 35,
      },
      {
        nombre: 'SSD Samsung 870 EVO 1TB',
        descripcion:
          'SSD SATA de 2.5 pulgadas con velocidades de hasta 560 MB/s. Tecnología V-NAND y software Samsung Magician incluido.',
        imagen:
          'https://images.unsplash.com/photo-1601625148755-6c9b75c25f86?w=600&h=600&fit=crop',
        precioUnitario: 130000,
        stock: 16,
      },
      {
        nombre: 'Disco externo WD Elements 1TB',
        descripcion:
          'Disco duro portátil USB 3.0 de 1TB. Compatible con Windows y Mac, plug and play sin necesidad de software adicional.',
        imagen:
          'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&h=600&fit=crop',
        precioUnitario: 75000,
        stock: 20,
      },
      {
        nombre: 'Pendrive SanDisk 64GB',
        descripcion:
          'Pendrive USB 3.0 de 64GB con velocidad de lectura de hasta 130 MB/s. Diseño compacto y resistente.',
        imagen:
          'https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=600&h=600&fit=crop',
        precioUnitario: 12000,
        stock: 50,
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
