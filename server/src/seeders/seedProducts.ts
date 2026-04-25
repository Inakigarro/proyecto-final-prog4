import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import Category, { ICategory } from '../models/Category';
import Item, { IItem } from '../models/Item';

// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO TECNOLÓGICO
// Idempotente: usa upsert tanto en categorías como en items.
// Se puede correr múltiples veces sin duplicar datos.
//
// Orden interno:
//  1. Crea/actualiza las categorías vacías (con validateBeforeSave: false
//     porque el modelo Categoria exige al menos 1 item).
//  2. Crea/actualiza los items asociándoles su categoría.
//  3. Actualiza cada categoría con la lista final de items.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Catálogo declarativo: lista de categorías y los items que pertenecen a cada una.
 * Para agregar productos nuevos solo hay que extender los arrays de items.
 */
const CATALOGO: { categoria: string; items: { nombre: string; precioUnitario: number; stock: number }[] }[] = [
  {
    categoria: 'Notebooks',
    items: [
      { nombre: 'Notebook Lenovo IdeaPad 3',     precioUnitario: 850000,  stock: 8  },
      { nombre: 'Notebook HP Pavilion 15',       precioUnitario: 1100000, stock: 5  },
      { nombre: 'Notebook Asus VivoBook 14',     precioUnitario: 920000,  stock: 6  },
      { nombre: 'MacBook Air M2',                precioUnitario: 2150000, stock: 3  },
    ],
  },
  {
    categoria: 'Smartphones',
    items: [
      { nombre: 'Samsung Galaxy A54',            precioUnitario: 480000,  stock: 12 },
      { nombre: 'Xiaomi Redmi Note 13',          precioUnitario: 320000,  stock: 15 },
      { nombre: 'Motorola Moto G84',             precioUnitario: 360000,  stock: 10 },
      { nombre: 'iPhone 15',                     precioUnitario: 1750000, stock: 4  },
    ],
  },
  {
    categoria: 'Periféricos',
    items: [
      { nombre: 'Teclado mecánico Redragon Kumara',  precioUnitario: 55000,  stock: 20 },
      { nombre: 'Mouse Logitech G203',               precioUnitario: 38000,  stock: 25 },
      { nombre: 'Monitor LG 24" Full HD',            precioUnitario: 270000, stock: 9  },
      { nombre: 'Webcam Logitech C920',              precioUnitario: 95000,  stock: 14 },
    ],
  },
  {
    categoria: 'Audio',
    items: [
      { nombre: 'Auriculares Sony WH-CH520',     precioUnitario: 85000,  stock: 18 },
      { nombre: 'Auriculares JBL Tune 510BT',    precioUnitario: 65000,  stock: 22 },
      { nombre: 'Parlante Bluetooth JBL Go 3',   precioUnitario: 45000,  stock: 30 },
      { nombre: 'Auriculares HyperX Cloud II',   precioUnitario: 145000, stock: 7  },
    ],
  },
  {
    categoria: 'Almacenamiento',
    items: [
      { nombre: 'SSD Kingston NV2 500GB',        precioUnitario: 58000,  stock: 35 },
      { nombre: 'SSD Samsung 870 EVO 1TB',       precioUnitario: 130000, stock: 16 },
      { nombre: 'Disco externo WD Elements 1TB', precioUnitario: 75000,  stock: 20 },
      { nombre: 'Pendrive SanDisk 64GB',         precioUnitario: 12000,  stock: 50 },
    ],
  },
];

/**
 * Punto de entrada del seeder.
 */
async function seed(): Promise<void> {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Conectado a MongoDB');

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
    console.log(`✓ Categoría '${grupo.categoria}' con ${idsItems.length} items`);
  }

  console.log('');
  console.log(`✓ Total: ${categoriasSincronizadas} categorías y ${itemsSincronizados} items sincronizados`);

  await mongoose.disconnect();
  console.log('Seeder finalizado');
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
 * Si el item ya existe, actualiza precio y stock (útil para reflejar cambios
 * declarados en el catálogo sin perder el _id ni las referencias).
 */
async function upsertItem(
  datos: { nombre: string; precioUnitario: number; stock: number },
  categoriaId: Types.ObjectId
): Promise<IItem> {
  const item = await Item.findOneAndUpdate(
    { nombre: datos.nombre },
    {
      nombre: datos.nombre,
      precioUnitario: datos.precioUnitario,
      stock: datos.stock,
      category: [categoriaId],
    },
    { upsert: true, new: true, runValidators: true }
  );
  return item as IItem;
}

seed().catch((error) => {
  console.error('Error en el seeder:', error);
  process.exit(1);
});