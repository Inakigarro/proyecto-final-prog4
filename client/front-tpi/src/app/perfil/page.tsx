'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import PerfilTabs from './_components/PerfilTabs';
import DatosPersonalesSeccion from './_components/DatosPersonalesSeccion';
import DireccionesSeccion from './_components/DireccionesSeccion';
import ComprasSeccion from './_components/ComprasSeccion';
import SeguridadSeccion from './_components/SeguridadSeccion';
import type { PerfilTab } from './_types';
import styles from './page.module.css';

/** Tabs válidas — se usa para validar el query param `?tab=`. */
const TABS_VALIDAS: readonly PerfilTab[] = ['datos', 'direcciones', 'compras', 'seguridad'] as const;

/**
 * Parsea el valor del query param `?tab=` y devuelve una tab válida.
 * Si el valor no matchea ninguna tab conocida, cae en 'datos'.
 */
function parsearTab(valor: string | null): PerfilTab {
  if (valor && TABS_VALIDAS.includes(valor as PerfilTab)) {
    return valor as PerfilTab;
  }
  return 'datos';
}

/**
 * Página `/perfil` del usuario común.
 *
 * Organiza los datos del usuario en cuatro secciones navegables por tabs:
 * - Datos personales (editable salvo email)
 * - Mis direcciones (listar + eliminar)
 * - Mis compras (placeholder hasta que el módulo de pedidos esté listo)
 * - Seguridad (cambio de contraseña con código por mail)
 *
 * Soporta deep-link via `?tab=direcciones|compras|seguridad|datos`. Cuando el
 * usuario cambia de tab manualmente, la URL se sincroniza con `router.replace`
 * para no contaminar el history.
 *
 * Requiere sesión iniciada: si no hay usuario hidratado, redirige a /login
 * conservando la URL de retorno.
 */
export default function PerfilPage() {
  const { isAutenticado, isCargando, usuario } = useAppSelector((s) => s.auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tabActiva, setTabActiva] = useState<PerfilTab>(() => parsearTab(searchParams.get('tab')));

  // Esperar a que termine la hidratación antes de decidir si redirigir
  useEffect(() => {
    if (isCargando) return;
    if (!isAutenticado) {
      router.replace('/login?redirect=/perfil');
    }
  }, [isCargando, isAutenticado, router]);

  // Sincroniza la tab activa si el query param cambia desde fuera (p.ej. al
  // clickear "Mis direcciones" en el navbar estando ya en /perfil)
  useEffect(() => {
    const desdeUrl = parsearTab(searchParams.get('tab'));
    setTabActiva((actual) => (actual === desdeUrl ? actual : desdeUrl));
  }, [searchParams]);

  /** Cambia de tab y refleja el cambio en la URL sin agregar entrada al history. */
  const cambiarTab = useCallback((tab: PerfilTab) => {
    setTabActiva(tab);
    router.replace(`/perfil?tab=${tab}`, { scroll: false });
  }, [router]);

  if (isCargando || !usuario) return null;

  return (
    <main className={styles.contenedor}>
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>Mi perfil</h1>
        <p className={styles.subtitulo}>
          Hola, {usuario.nombre}. Desde acá podés revisar tus datos, direcciones y compras.
        </p>
      </header>

      <PerfilTabs tabActiva={tabActiva} alCambiar={cambiarTab} />

      <div className={styles.contenidoTab} role="tabpanel">
        {tabActiva === 'datos' && <DatosPersonalesSeccion usuario={usuario} />}
        {tabActiva === 'direcciones' && <DireccionesSeccion habilitado={isAutenticado} />}
        {tabActiva === 'compras' && <ComprasSeccion habilitado={isAutenticado} />}
        {tabActiva === 'seguridad' && <SeguridadSeccion usuario={usuario} />}
      </div>
    </main>
  );
}
