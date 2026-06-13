'use client';

import type { Direccion } from '../_types';
import styles from './TarjetaDireccion.module.css';

interface TarjetaDireccionProps {
  direccion: Direccion;
  /** True mientras se está eliminando esta dirección en particular */
  eliminando?: boolean;
  /** Callback disparado al clickear el botón de eliminar */
  alEliminar: () => void;
}

/**
 * Tarjeta visual de una dirección dentro de la lista de "Mis direcciones".
 *
 * Es de presentación pura: no maneja confirmación ni llamadas al backend.
 * Solo notifica al padre cuando el usuario clickea eliminar.
 */
export default function TarjetaDireccion({ direccion, eliminando = false, alEliminar }: TarjetaDireccionProps) {
  return (
    <article className={styles.tarjeta} aria-label={`Dirección en ${direccion.ciudad}`}>
      <div className={styles.contenido}>
        <p className={styles.calleNumero}>
          {direccion.calle} {direccion.numero}
          {direccion.piso && <span className={styles.complemento}>, Piso {direccion.piso}</span>}
          {direccion.departamento && <span className={styles.complemento}>, Depto {direccion.departamento}</span>}
        </p>
        <p className={styles.ciudadProvincia}>
          {direccion.ciudad}, {direccion.provincia}
        </p>
        <p className={styles.codigoPostal}>CP {direccion.codigoPostal}</p>
      </div>

      <button
        type="button"
        className={styles.botonEliminar}
        onClick={alEliminar}
        disabled={eliminando}
        aria-label={`Eliminar dirección en ${direccion.calle} ${direccion.numero}`}
      >
        {eliminando ? 'Eliminando…' : 'Eliminar'}
      </button>
    </article>
  );
}
