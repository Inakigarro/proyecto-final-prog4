'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import DashboardSidebar from '@/component/dashboard/DashboardSidebar';
import styles from './dashboard.module.css';

/**
 * Roles autorizados para acceder al panel de gestión.
 * - `dueno`: gestiona catálogo, categorías y promociones (rol principal del panel).
 * - `superadmin`: tiene acceso total al sistema; el backend admite sus requests
 *   sobre los mismos endpoints CRUD, así que tiene sentido que también vea la UI.
 */
const ROLES_AUTORIZADOS = ['dueno', 'superadmin'] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAutenticado, isCargando, usuario } = useAppSelector((s) => s.auth);

  const tieneAcceso =
    usuario?.roles.some((r) => (ROLES_AUTORIZADOS as readonly string[]).includes(r.nombre)) ?? false;

  useEffect(() => {
    if (isCargando) return;
    if (!isAutenticado) {
      router.replace('/login?redirect=/dashboard');
      return;
    }
    if (!tieneAcceso) {
      router.replace('/');
    }
  }, [isCargando, isAutenticado, tieneAcceso, router]);

  if (isCargando || !isAutenticado) return null;
  if (!tieneAcceso) return null;

  return (
    <div className={styles.contenedor}>
      <DashboardSidebar />
      <main className={styles.contenido}>{children}</main>
    </div>
  );
}
