'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import PerfilTabs from './_components/PerfilTabs';
import DatosPersonalesSeccion from './_components/DatosPersonalesSeccion';
import DireccionesSeccion from './_components/DireccionesSeccion';
import ComprasSeccion from './_components/ComprasSeccion';
import type { PerfilTab } from './_types';
import styles from './page.module.css';

/**
 * Página `/perfil` del usuario común.
 *
 * Organiza los datos del usuario en tres secciones navegables por tabs:
 * - Datos personales (read-only excepto teléfono)
 * - Mis direcciones (listar + eliminar)
 * - Mis compras (placeholder hasta que el módulo de pedidos esté listo)
 *
 * Requiere sesión iniciada: si no hay usuario hidratado, redirige a /login
 * conservando la URL de retorno.
 */
export default function PerfilPage() {
  const { isAutenticado, isCargando, usuario } = useAppSelector((s) => s.auth);
  const router = useRouter();
  const [tabActiva, setTabActiva] = useState<PerfilTab>('datos');

  // Esperar a que termine la hidratación antes de decidir si redirigir
  useEffect(() => {
    if (isCargando) return;
    if (!isAutenticado) {
      router.replace('/login?redirect=/perfil');
    }
  }, [isCargando, isAutenticado, router]);

  if (isCargando || !usuario) return null;

  return (
    <main className={styles.contenedor}>
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>Mi perfil</h1>
        <p className={styles.subtitulo}>
          Hola, {usuario.nombre}. Desde acá podés revisar tus datos, direcciones y compras.
        </p>
      </header>

      <PerfilTabs tabActiva={tabActiva} alCambiar={setTabActiva} />

      <div className={styles.contenidoTab} role="tabpanel">
        {tabActiva === 'datos' && <DatosPersonalesSeccion usuario={usuario} />}
        {tabActiva === 'direcciones' && <DireccionesSeccion habilitado={isAutenticado} />}
        {tabActiva === 'compras' && <ComprasSeccion habilitado={isAutenticado} />}
      </div>
    </main>
  );
}
