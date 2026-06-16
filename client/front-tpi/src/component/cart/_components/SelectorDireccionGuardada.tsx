'use client';

import type { Direccion } from '@/app/perfil/_types';

/**
 * Sentinela usado por el `<select>` para indicar "Nueva dirección".
 * Definido como string vacío para que combine bien con el value default
 * de los selects HTML.
 */
export const VALOR_NUEVA_DIRECCION = '';

interface SelectorDireccionGuardadaProps {
  /** Direcciones activas del usuario autenticado. */
  direcciones: Direccion[];
  /** Id de la dirección elegida, o {@link VALOR_NUEVA_DIRECCION} para "Nueva dirección". */
  valor: string;
  /** Se invoca al cambiar la selección. Recibe el id elegido o el sentinela. */
  onCambiar: (valor: string) => void;
  /** Deshabilita el selector mientras se cargan los datos. */
  cargando?: boolean;
}

/**
 * Devuelve un texto corto para identificar una dirección en el dropdown.
 * Solo muestra calle + número + ciudad: alcanza para que el usuario reconozca
 * cuál es sin que el option se haga inmanejable.
 */
function etiquetar(d: Direccion): string {
  return `${d.calle} ${d.numero}, ${d.ciudad}`;
}

/**
 * Selector de dirección guardada en el paso de envío del checkout.
 *
 * Lista las direcciones activas del usuario y agrega una opción
 * "+ Nueva dirección" para forzar el alta de una nueva. Si el usuario no
 * tiene direcciones guardadas, el componente queda oculto (el padre debe
 * mostrar directamente el formulario de alta).
 */
const SelectorDireccionGuardada = ({
  direcciones,
  valor,
  onCambiar,
  cargando = false,
}: SelectorDireccionGuardadaProps) => {
  if (direcciones.length === 0) return null;

  return (
    <div className="checkout-envio-campo">
      <label htmlFor="envio-direccion-guardada">Direcciones guardadas</label>
      <select
        id="envio-direccion-guardada"
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        disabled={cargando}
      >
        <option value={VALOR_NUEVA_DIRECCION}>+ Nueva dirección</option>
        {direcciones.map((d) => (
          <option key={d.id} value={d.id}>
            {etiquetar(d)}
          </option>
        ))}
      </select>
      <span className="checkout-envio-ayuda">
        Elegí una dirección guardada o agregá una nueva más abajo.
      </span>
    </div>
  );
};

export default SelectorDireccionGuardada;
