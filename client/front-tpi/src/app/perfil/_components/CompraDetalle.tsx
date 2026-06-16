'use client';

import { useOrdenDetalle } from '../_hooks/useOrdenDetalle';
import styles from './CompraDetalle.module.css';

interface CompraDetalleProps {
  /** Id de la orden a mostrar. */
  ordenId: string;
  /** True cuando la sesión está hidratada (gatea el fetch). */
  habilitado: boolean;
  /** Se invoca cuando el usuario clickea "Volver" al listado. */
  alVolver: () => void;
}

/**
 * Formatea una fecha ISO al patrón dd/mm/aaaa HH:mm en español rioplatense.
 */
function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Vista de detalle de una compra puntual dentro de la pestaña "Mis compras".
 *
 * Renderiza el detalle de la orden (productos, envío, pago) y un botón
 * "Volver" que vuelve al listado de compras. El padre se encarga de manejar
 * el query param `orden` y de invocar `alVolver` para limpiarlo.
 */
const CompraDetalle = ({ ordenId, habilitado, alVolver }: CompraDetalleProps) => {
  const { orden, cargando, error } = useOrdenDetalle(ordenId, habilitado);

  return (
    <div className={styles.contenedor}>
      <button type="button" className={styles.volver} onClick={alVolver}>
        ← Volver al listado
      </button>

      {cargando && <p className={styles.estado}>Cargando orden...</p>}

      {error && <div className={styles.error}>{error}</div>}

      {!cargando && !error && !orden && (
        <p className={styles.estado}>No encontramos esta orden.</p>
      )}

      {orden && (
        <>
          <header className={styles.encabezado}>
            <h3 className={styles.titulo}>
              Orden #{orden.id.slice(-8).toUpperCase()}
            </h3>
            <p className={styles.fecha}>{formatearFecha(orden.fechaCreacion)}</p>
          </header>

          <section className={styles.seccion}>
            <h4 className={styles.seccionTitulo}>Productos</h4>
            <div className={styles.productos}>
              {orden.detalles.map((d) => (
                <div key={d.id} className={styles.productoFila}>
                  <div className={styles.productoInfo}>
                    <span className={styles.productoNombre}>{d.nombreItem}</span>
                    <span className={styles.productoCantidad}>
                      {d.cantidad} × ${d.precioUnitario.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <span className={styles.productoMonto}>
                    ${d.monto.toLocaleString('es-AR')}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.totalFila}>
              <span>Total</span>
              <strong>${orden.montoTotal.toLocaleString('es-AR')}</strong>
            </div>
          </section>

          <section className={styles.seccion}>
            <h4 className={styles.seccionTitulo}>Datos de envío</h4>
            <div className={styles.datos}>
              <p>{orden.envio.nombre} {orden.envio.apellido}</p>
              <p>
                {orden.envio.calle} {orden.envio.numero}
                {orden.envio.piso ? `, Piso ${orden.envio.piso}` : ''}
                {orden.envio.departamento ? ` Depto ${orden.envio.departamento}` : ''}
              </p>
              <p>
                {orden.envio.ciudad}, {orden.envio.provincia} ({orden.envio.codigoPostal})
              </p>
              <p>Tel: {orden.envio.telefono}</p>
            </div>
          </section>

          <section className={styles.seccion}>
            <h4 className={styles.seccionTitulo}>Método de pago</h4>
            <div className={styles.datos}>
              <p>{orden.tarjeta.marca} terminada en ****{orden.tarjeta.ultimos4}</p>
              <p className={styles.datoSecundario}>{orden.metodoPago.nombre}</p>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default CompraDetalle;
