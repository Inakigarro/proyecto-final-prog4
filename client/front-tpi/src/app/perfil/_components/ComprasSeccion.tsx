'use client';

import { useCompras } from '../_hooks/useCompras';
import type { CompraResumen } from '../_types';
import styles from './ComprasSeccion.module.css';

interface ComprasSeccionProps {
  /** True cuando la sesión está hidratada y se puede llamar al backend */
  habilitado: boolean;
}

/**
 * Sección "Mis compras" del perfil.
 *
 * Renderiza una tabla con el historial de pedidos del usuario. Hoy el hook
 * `useCompras` devuelve un array vacío y mostramos el estado "sin compras";
 * cuando el módulo de pedidos esté listo, basta con conectar el endpoint
 * dentro del hook y la UI ya queda funcionando.
 */
export default function ComprasSeccion({ habilitado }: ComprasSeccionProps) {
  const { compras, cargando, error } = useCompras(habilitado);

  return (
    <section className={styles.seccion} aria-labelledby="compras-titulo">
      <h2 id="compras-titulo" className={styles.tituloSeccion}>Mis compras</h2>
      <p className={styles.subtitulo}>
        Acá vas a poder consultar el historial de tus pedidos.
      </p>

      {cargando && <p className={styles.mensajeNeutro}>Cargando compras…</p>}
      {error && <p className={styles.errorGeneral} role="alert">{error}</p>}

      {!cargando && !error && compras.length === 0 && (
        <div className={styles.estadoVacio}>
          <p className={styles.estadoVacioTitulo}>Todavía no tenés compras registradas</p>
          <p className={styles.estadoVacioSubtitulo}>
            Cuando hagas tu primer pedido, vas a poder seguirlo desde acá.
          </p>
        </div>
      )}

      {!cargando && !error && compras.length > 0 && (
        <TablaCompras compras={compras} />
      )}
    </section>
  );
}

/**
 * Tabla con el resumen de compras. Se separa del componente padre para
 * mantener al `ComprasSeccion` enfocado en orquestar estados (vacío/error/etc.)
 */
function TablaCompras({ compras }: { compras: CompraResumen[] }) {
  return (
    <div className={styles.contenedorTabla}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>N° pedido</th>
            <th>Fecha</th>
            <th>Items</th>
            <th>Estado</th>
            <th className={styles.celdaDerecha}>Total</th>
          </tr>
        </thead>
        <tbody>
          {compras.map((compra) => (
            <tr key={compra.id}>
              <td className={styles.idPedido}>#{compra.id.slice(-6)}</td>
              <td>{formatearFecha(compra.fecha)}</td>
              <td>{compra.cantidadItems}</td>
              <td>
                <span className={styles.badgeEstado}>{compra.estado}</span>
              </td>
              <td className={styles.celdaDerecha}>{formatearMonto(compra.montoTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Formatea una fecha ISO a dd/mm/aaaa en español rioplatense. */
function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/** Formatea un monto numérico como pesos argentinos. */
function formatearMonto(monto: number): string {
  return monto.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
}
