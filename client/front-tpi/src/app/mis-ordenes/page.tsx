'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import type { OrdenResumen } from '@/lib/order-types';
import styles from './page.module.css';

/**
 * Página `/mis-ordenes` — historial de compras del usuario autenticado.
 *
 * Consume GET /api/orders/me y muestra un listado de órdenes con fecha,
 * total, cantidad de items y datos de pago resumidos. Cada orden es
 * clickeable para ver su detalle.
 */
export default function MisOrdenesPage() {
  const { isAutenticado, isCargando, usuario } = useAppSelector((s) => s.auth);
  const router = useRouter();

  const [ordenes, setOrdenes] = useState<OrdenResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirigir si no hay sesión
  useEffect(() => {
    if (isCargando) return;
    if (!isAutenticado) {
      router.replace('/login?redirect=/mis-ordenes');
    }
  }, [isCargando, isAutenticado, router]);

  // Cargar órdenes
  useEffect(() => {
    if (!isAutenticado || isCargando) return;

    const cargar = async () => {
      try {
        const data = await apiFetch<OrdenResumen[]>('/api/orders/me');
        setOrdenes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar las órdenes');
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [isAutenticado, isCargando]);

  if (isCargando || !usuario) return null;

  return (
    <main className={styles.contenedor}>
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>Mis compras</h1>
        <p className={styles.subtitulo}>
          Historial de todas tus órdenes de compra.
        </p>
      </header>

      {cargando && (
        <p className={styles.estado}>Cargando órdenes...</p>
      )}

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      {!cargando && !error && ordenes.length === 0 && (
        <div className={styles.vacio}>
          <p>Todavía no realizaste ninguna compra.</p>
          <Link href="/" className={styles.botonPrimario}>
            Ir a la tienda
          </Link>
        </div>
      )}

      {!cargando && ordenes.length > 0 && (
        <div className={styles.lista}>
          {ordenes.map((orden) => (
            <Link
              key={orden.id}
              href={`/mis-ordenes/${orden.id}`}
              className={styles.card}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardOrden}>
                  Orden #{orden.id.slice(-8).toUpperCase()}
                </span>
                <span className={styles.cardFecha}>
                  {new Date(orden.fechaCreacion).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardInfo}>
                  <span>{orden.cantidadItems} {orden.cantidadItems === 1 ? 'producto' : 'productos'}</span>
                  <span className={styles.cardPago}>
                    {orden.tarjeta.marca} ****{orden.tarjeta.ultimos4}
                  </span>
                </div>
                <span className={styles.cardTotal}>
                  ${orden.montoTotal.toLocaleString('es-AR')}
                </span>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.cardEnvio}>
                  Envío a: {orden.envio.nombre} {orden.envio.apellido}
                </span>
                <span className={styles.cardVer}>Ver detalle →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}