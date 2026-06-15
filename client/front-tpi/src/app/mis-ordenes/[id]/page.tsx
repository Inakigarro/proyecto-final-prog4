'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import type { OrdenDetalle } from '@/lib/order-types';
import styles from './page.module.css';

/**
 * Página `/mis-ordenes/[id]` — detalle de una orden del usuario.
 *
 * Consume GET /api/orders/me/:id y muestra el detalle completo:
 * productos, datos de envío, método de pago y total.
 */
export default function OrdenDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { isAutenticado, isCargando } = useAppSelector((s) => s.auth);
  const router = useRouter();

  const [orden, setOrden] = useState<OrdenDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isCargando) return;
    if (!isAutenticado) {
      router.replace('/login?redirect=/mis-ordenes');
    }
  }, [isCargando, isAutenticado, router]);

  useEffect(() => {
    if (!isAutenticado || isCargando || !id) return;

    const cargar = async () => {
      try {
        const data = await apiFetch<OrdenDetalle>(`/api/orders/me/${id}`);
        setOrden(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la orden');
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [isAutenticado, isCargando, id]);

  if (isCargando) return null;

  if (cargando) {
    return (
      <main className={styles.contenedor}>
        <p className={styles.estado}>Cargando orden...</p>
      </main>
    );
  }

  if (error || !orden) {
    return (
      <main className={styles.contenedor}>
        <div className={styles.error}>
          {error ?? 'Orden no encontrada'}
        </div>
        <Link href="/mis-ordenes" className={styles.volver}>
          ← Volver a mis compras
        </Link>
      </main>
    );
  }

  const ordenCorta = orden.id.slice(-8).toUpperCase();
  const fecha = new Date(orden.fechaCreacion).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <main className={styles.contenedor}>
      <Link href="/mis-ordenes" className={styles.volver}>
        ← Volver a mis compras
      </Link>

      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>Orden #{ordenCorta}</h1>
        <p className={styles.fecha}>{fecha}</p>
      </header>

      {/* Productos */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Productos</h2>
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

      {/* Envío */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Datos de envío</h2>
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

      {/* Pago */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Método de pago</h2>
        <div className={styles.datos}>
          <p>{orden.tarjeta.marca} terminada en ****{orden.tarjeta.ultimos4}</p>
          <p className={styles.datoSecundario}>{orden.metodoPago.nombre}</p>
        </div>
      </section>
    </main>
  );
}