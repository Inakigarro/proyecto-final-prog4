/**
 * Lista canónica de jurisdicciones de Argentina (23 provincias + CABA).
 * Ordenada alfabéticamente para que el dropdown del form de envío sea
 * fácil de recorrer.
 *
 * Las provincias se guardan como string libre en `Address` y `PurchaseOrder`,
 * así que esta lista solo se usa en el frontend para el selector. El backend
 * acepta cualquier string no vacío.
 */
export const PROVINCIAS_ARGENTINA: ReadonlyArray<string> = [
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Ciudad Autónoma de Buenos Aires',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

/**
 * Devuelve la versión canónica de un nombre de provincia haciendo match
 * case-insensitive contra la lista. Si no encuentra coincidencia, devuelve
 * el valor original (puede pasar con direcciones guardadas en versiones
 * anteriores que no respetaban la lista).
 *
 * @param valor - Nombre de provincia a normalizar.
 */
export function normalizarProvincia(valor: string): string {
  const limpio = valor.trim();
  if (!limpio) return '';
  const canonica = PROVINCIAS_ARGENTINA.find(
    (p) => p.toLowerCase() === limpio.toLowerCase(),
  );
  return canonica ?? limpio;
}
