/**
 * Tests de integración para ProductService.listarProductos.
 * Usa MongoMemoryServer (sin réplicas) porque no hay transacciones.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ProductService } from '../../services/rbac/product.service';
import Category from '../../models/Category';
import Item from '../../models/Item';
import {
  conectarBdTest,
  desconectarBdTest,
  limpiarColecciones,
} from './helpers';

jest.setTimeout(60000);

describe('ProductService.listarProductos', () => {
  let server: MongoMemoryServer;
  const servicio = new ProductService();
  let categoriaId: string;

  beforeAll(async () => {
    server = await conectarBdTest();

    // Semilla: 1 categoría + 5 items activos
    const cat = await Category.create({ nombre: 'Electrónica' });
    categoriaId = cat._id.toString();

    for (let i = 1; i <= 5; i++) {
      await Item.create({
        nombre: `Producto ${i}`,
        descripcion: `Descripción del producto ${i}`,
        precioUnitario: i * 100,
        stock: i * 5,
        category: [cat._id],
      });
    }
  });

  afterAll(() => desconectarBdTest(server));

  // No se necesita limpiar entre tests: todos leen el mismo dataset de semilla

  // ──────────────────────────────────────────────
  test('sin filtro → primera página con totalPaginas correcto', async () => {
    const resultado = await servicio.listarProductos({ pagina: 1, limite: 2 });

    expect(resultado.total).toBe(5);
    expect(resultado.datos).toHaveLength(2);
    expect(resultado.totalPaginas).toBe(3); // ceil(5/2) = 3
    expect(resultado.pagina).toBe(1);
    expect(resultado.limite).toBe(2);
  });

  // ──────────────────────────────────────────────
  test('con q → filtra items por nombre', async () => {
    const resultado = await servicio.listarProductos({ q: 'Producto 3' });

    expect(resultado.datos).toHaveLength(1);
    expect(resultado.datos[0].nombre).toBe('Producto 3');
  });

  // ──────────────────────────────────────────────
  test('con q → filtra items por nombre de categoría', async () => {
    const resultado = await servicio.listarProductos({ q: 'Electrónica' });

    // Todos los items pertenecen a esa categoría
    expect(resultado.total).toBe(5);
    expect(resultado.datos.length).toBeGreaterThan(0);
  });

  // ──────────────────────────────────────────────
  test('pagina muy alta → datos vacíos, sin lanzar error', async () => {
    const resultado = await servicio.listarProductos({ pagina: 999, limite: 20 });

    expect(resultado.datos).toHaveLength(0);
    expect(resultado.total).toBe(5);      // el total sigue siendo correcto
    expect(resultado.totalPaginas).toBe(1);
  });

  // ──────────────────────────────────────────────
  test('items inactivos no aparecen en el listado', async () => {
    // Desactivar un item
    await Item.updateOne({ nombre: 'Producto 1' }, { activo: false });

    const resultado = await servicio.listarProductos({});
    const nombres = resultado.datos.map((d) => d.nombre);
    expect(nombres).not.toContain('Producto 1');

    // Restaurar para no afectar otros tests
    await Item.updateOne({ nombre: 'Producto 1' }, { activo: true });
  });
});
