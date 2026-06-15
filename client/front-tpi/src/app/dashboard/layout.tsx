'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import DashboardSidebar from '@/component/dashboard/DashboardSidebar';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAutenticado, isCargando, usuario } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isCargando) return;
    if (!isAutenticado) {
      router.replace('/login?redirect=/dashboard');
      return;
    }
    const esDueno = usuario?.roles.some((r) => r.nombre === 'dueno') ?? false;
    if (!esDueno) {
      router.replace('/');
    }
  }, [isCargando, isAutenticado, usuario, router]);

  if (isCargando || !isAutenticado) return null;

  const esDueno = usuario?.roles.some((r) => r.nombre === 'dueno') ?? false;
  if (!esDueno) return null;

  return (
    <div className={styles.contenedor}>
      <DashboardSidebar />
      <main className={styles.contenido}>{children}</main>
    </div>
  );
}
