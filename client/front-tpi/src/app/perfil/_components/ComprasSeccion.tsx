'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCompras } from '../_hooks/useCompras';
import CompraCard from './CompraCard';
import CompraDetalle from './CompraDetalle';
import styles from './ComprasSeccion.module.css';

interface ComprasSeccionProps {
  /** True cuando la sesión está hidratada y se puede llamar al backend. */
  habilitado: boolean;
}

/**
 * Sección "Mis compras" del perfil.
 *
 * Orquesta dos vistas según el query param `orden`:
 * - Sin `orden`: listado de cards con todas las compras del usuario.
 * - Con `orden=ID`: detalle de esa compra puntual con botón de volver.
 *
 * Reemplaza la antigua ruta `/mis-ordenes` para que todo el historial de
 * compras viva dentro del perfil con una sola URL canónica.
 */
export default function ComprasSeccion({ habilitado }: ComprasSeccionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ordenId = searchParams.get('orden');

  const { compras, cargando, error } = useCompras(habilitado);

  /** Navega al detalle de una compra particular sin agregar entrada al history. */
  const verDetalle = useCallback(
    (id: string) => {
      router.replace(`/perfil?tab=compras&orden=${id}`, { scroll: false });
    },
    [router],
  );

  /** Vuelve al listado limpiando el `orden` del URL. */
  const volverAlListado = useCallback(() => {
    router.replace('/perfil?tab=compras', { scroll: false });
  }, [router]);

  // Detalle de una compra puntual
  if (ordenId) {
    return (
      <section className={styles.seccion} aria-labelledby="compras-titulo">
        <h2 id="compras-titulo" className={styles.tituloSeccion}>Mis compras</h2>
        <CompraDetalle
          ordenId={ordenId}
          habilitado={habilitado}
          alVolver={volverAlListado}
        />
      </section>
    );
  }

  // Listado
  return (
    <section className={styles.seccion} aria-labelledby="compras-titulo">
      <h2 id="compras-titulo" className={styles.tituloSeccion}>Mis compras</h2>
      <p className={styles.subtitulo}>
        Historial completo de tus órdenes de compra. Hacé click en una para ver el detalle.
      </p>

      {cargando && <p className={styles.mensajeNeutro}>Cargando compras…</p>}

      {error && <p className={styles.errorGeneral} role="alert">{error}</p>}

      {!cargando && !error && compras.length === 0 && (
        <div className={styles.estadoVacio}>
          <p className={styles.estadoVacioTitulo}>Todavía no tenés compras registradas</p>
          <p className={styles.estadoVacioSubtitulo}>
            Cuando hagas tu primer pedido, vas a poder seguirlo desde acá.
          </p>
          <Link href="/" className={styles.botonPrimario}>
            Ir a la tienda
          </Link>
        </div>
      )}

      {!cargando && !error && compras.length > 0 && (
        <div className={styles.lista}>
          {compras.map((compra) => (
            <CompraCard key={compra.id} compra={compra} alVerDetalle={verDetalle} />
          ))}
        </div>
      )}
    </section>
  );
}
