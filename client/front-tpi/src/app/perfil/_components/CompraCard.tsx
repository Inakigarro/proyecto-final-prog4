'use client';

import type { OrdenResumen } from '@/lib/order-types';
import styles from './CompraCard.module.css';

interface CompraCardProps {
  /** Resumen de la compra a renderizar. */
  compra: OrdenResumen;
  /** Se invoca cuando el usuario clickea para ver el detalle de la compra. */
  alVerDetalle: (ordenId: string) => void;
}

/**
 * Formatea una fecha ISO al patrón dd/mm/aaaa en español rioplatense.
 * Si la fecha no es parseable, devuelve un guión.
 */
function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Tarjeta individual para el listado de "Mis compras" del perfil.
 *
 * Muestra cabecera (número de orden + fecha), cuerpo (cantidad de items +
 * tarjeta + total) y pie (a quién se envió + CTA "Ver detalle"). Toda la
 * tarjeta es clickeable para navegar al detalle.
 */
const CompraCard = ({ compra, alVerDetalle }: CompraCardProps) => {
  const cantidad = compra.cantidadItems;
  const totalAR = compra.montoTotal.toLocaleString('es-AR');

  return (
    <button
      type="button"
      onClick={() => alVerDetalle(compra.id)}
      className={styles.card}
      aria-label={`Ver detalle de la orden ${compra.id.slice(-8).toUpperCase()}`}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardOrden}>
          Orden #{compra.id.slice(-8).toUpperCase()}
        </span>
        <span className={styles.cardFecha}>{formatearFecha(compra.fechaCreacion)}</span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardInfo}>
          <span>{cantidad} {cantidad === 1 ? 'producto' : 'productos'}</span>
          <span className={styles.cardPago}>
            {compra.tarjeta.marca} ****{compra.tarjeta.ultimos4}
          </span>
        </div>
        <span className={styles.cardTotal}>${totalAR}</span>
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.cardEnvio}>
          Envío a: {compra.envio.nombre} {compra.envio.apellido}
        </span>
        <span className={styles.cardVer}>Ver detalle →</span>
      </div>
    </button>
  );
};

export default CompraCard;
