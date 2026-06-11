import { aplicarDescuentos } from '../../utils/descuentos';

describe('aplicarDescuentos', () => {
  test('sin descuentos devuelve el monto base', () => {
    expect(aplicarDescuentos(100, [])).toBe(100);
  });

  test('descuento del 50 % devuelve la mitad exacta', () => {
    expect(aplicarDescuentos(100, [50])).toBe(50);
  });

  test('dos descuentos del 50 % son acumulativos — resultado 25, no 0', () => {
    // 100 * 0.5 * 0.5 = 25  (no es 100 - 50% - 50% = 0)
    expect(aplicarDescuentos(100, [50, 50])).toBe(25);
  });

  test('descuento del 0 % no modifica el monto', () => {
    expect(aplicarDescuentos(200, [0])).toBe(200);
  });

  test('descuento del 100 % resulta en 0', () => {
    expect(aplicarDescuentos(100, [100])).toBe(0);
  });

  test('preserva exactamente 2 decimales', () => {
    // 10 * (1 - 0.33) = 10 * 0.67 = 6.70
    expect(aplicarDescuentos(10, [33])).toBe(6.7);
  });
});
