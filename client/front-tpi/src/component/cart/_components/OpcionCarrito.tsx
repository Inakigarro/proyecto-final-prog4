'use client';

import type { CartItem } from '@/lib/cart-types';
import styles from './OpcionCarrito.module.css';

interface OpcionCarritoProps {
  /** Id único de esta opción (se usa como value del radio). */
  id: 'guest' | 'user';
  /** Texto del encabezado de la tarjeta ("Carrito actual" / "Carrito guardado"). */
  titulo: string;
  /** Texto secundario aclaratorio bajo el título. */
  descripcion: string;
  /** Items que componen este carrito. */
  items: CartItem[];
  /** True si esta opción es la que el usuario tiene seleccionada. */
  seleccionado: boolean;
  /** Se invoca al hacer click en cualquier parte de la opción. */
  alSeleccionar: () => void;
}

/**
 * Calcula la cantidad total de unidades en un carrito.
 */
function cantidadTotal(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + i.cantidad, 0);
}

/**
 * Calcula el subtotal estimado de un carrito (sin promociones aplicadas).
 */
function subtotalEstimado(items: CartItem[]): number {
  return items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);
}

/**
 * Opción individual del modal de conflicto entre carritos.
 *
 * Renderiza una tarjeta con un radio button, el listado de items del
 * carrito y un resumen al pie. Toda la tarjeta es clickeable para
 * facilitar el toggle del radio.
 */
const OpcionCarrito = ({
  id,
  titulo,
  descripcion,
  items,
  seleccionado,
  alSeleccionar,
}: OpcionCarritoProps) => {
  const unidades = cantidadTotal(items);
  const subtotal = subtotalEstimado(items);

  return (
    <label
      className={`${styles.opcion} ${seleccionado ? styles.opcionSeleccionada : ''}`}
    >
      <div className={styles.encabezado}>
        <input
          type="radio"
          name="conflicto-carrito"
          value={id}
          checked={seleccionado}
          onChange={alSeleccionar}
          className={styles.radio}
        />
        <div className={styles.tituloBloque}>
          <span className={styles.titulo}>{titulo}</span>
          <span className={styles.descripcion}>{descripcion}</span>
        </div>
      </div>

      <ul className={styles.listaItems}>
        {items.map((item) => (
          <li key={item.itemId} className={styles.item}>
            <span className={styles.itemNombre}>{item.nombre}</span>
            <span className={styles.itemDetalle}>
              {item.cantidad} × ${item.precioUnitario.toLocaleString('es-AR')}
            </span>
          </li>
        ))}
      </ul>

      <div className={styles.resumen}>
        <span>
          {unidades} {unidades === 1 ? 'unidad' : 'unidades'}
        </span>
        <strong>${subtotal.toLocaleString('es-AR')}</strong>
      </div>
    </label>
  );
};

export default OpcionCarrito;
