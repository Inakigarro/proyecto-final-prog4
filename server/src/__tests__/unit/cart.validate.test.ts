/**
 * Tests unitarios de CartService.validateCart.
 * No tocan la base de datos: se mockea Item.find con jest.
 */
import { Types } from 'mongoose';
import { CartService } from '../../services/rbac/cart.service';

// Reemplaza el módulo antes de que CartService lo importe
jest.mock('../../models/Item', () => ({
  __esModule: true,
  default: { find: jest.fn() },
}));

import Item from '../../models/Item';
const mockFind = Item.find as jest.Mock;

describe('CartService.validateCart', () => {
  const servicio = new CartService();

  beforeEach(() => jest.clearAllMocks());

  // ──────────────────────────────────────────────
  // Carrito vacío
  // ──────────────────────────────────────────────
  test('carrito vacío lanza error', async () => {
    await expect(servicio.validateCart({ items: [] }))
      .rejects.toThrow('El carrito no puede estar vacío');
  });

  // ──────────────────────────────────────────────
  // Item inexistente en BD
  // ──────────────────────────────────────────────
  test('item inexistente → disponible: false y motivo correcto', async () => {
    mockFind.mockResolvedValue([]); // la BD no devuelve ningún item
    const itemId = new Types.ObjectId().toString();

    const resultado = await servicio.validateCart({
      items: [{ itemId, cantidad: 1 }],
    });

    expect(resultado.carritoValido).toBe(false);
    expect(resultado.items[0].disponible).toBe(false);
    expect(resultado.items[0].motivo).toBe('Item inexistente');
  });

  // ──────────────────────────────────────────────
  // Stock insuficiente
  // ──────────────────────────────────────────────
  test('stock insuficiente → disponible: false y motivo correcto', async () => {
    const itemId = new Types.ObjectId();
    mockFind.mockResolvedValue([
      { _id: itemId, nombre: 'Laptop', precioUnitario: 1000, stock: 1 },
    ]);

    const resultado = await servicio.validateCart({
      items: [{ itemId: itemId.toString(), cantidad: 5 }], // pide 5, hay 1
    });

    expect(resultado.carritoValido).toBe(false);
    expect(resultado.items[0].disponible).toBe(false);
    expect(resultado.items[0].motivo).toBe('Stock insuficiente');
  });

  // ──────────────────────────────────────────────
  // Happy path: todo OK
  // ──────────────────────────────────────────────
  test('todo OK → carritoValido: true, subtotales y total correctos', async () => {
    const itemId = new Types.ObjectId();
    mockFind.mockResolvedValue([
      { _id: itemId, nombre: 'Monitor', precioUnitario: 500, stock: 10 },
    ]);

    const resultado = await servicio.validateCart({
      items: [{ itemId: itemId.toString(), cantidad: 2 }],
    });

    expect(resultado.carritoValido).toBe(true);
    expect(resultado.items[0].disponible).toBe(true);
    expect(resultado.items[0].subtotal).toBe(1000); // 500 * 2
    expect(resultado.total).toBe(1000);
  });
});
