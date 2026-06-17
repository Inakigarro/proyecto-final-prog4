'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import styles from './DashboardSidebar.module.css';

const ENTIDADES_COMUNES = [
  { etiqueta: 'Productos',       ruta: '/dashboard/productos' },
  { etiqueta: 'Categorías',      ruta: '/dashboard/categorias' },
  { etiqueta: 'Promociones',     ruta: '/dashboard/promociones' },
  { etiqueta: 'Slider del home', ruta: '/dashboard/slider' },
];

const ENTIDADES_SUPERADMIN = [
  { etiqueta: 'Usuarios',        ruta: '/dashboard/usuarios' },
];

export default function DashboardSidebar() {
  const rutaActual = usePathname();
  const usuario = useAppSelector((s) => s.auth.usuario);

  const esSuperAdmin = usuario?.roles.some((r) => r.nombre === 'superadmin') ?? false;

  const entidades = esSuperAdmin
    ? [...ENTIDADES_COMUNES, ...ENTIDADES_SUPERADMIN]
    : ENTIDADES_COMUNES;

  return (
    <aside className={styles.sidebar}>
      <p className={styles.titulo}>Gestión</p>
      <nav>
        <ul className={styles.lista}>
          {entidades.map(({ etiqueta, ruta }) => {
            const activo = rutaActual.startsWith(ruta);
            return (
              <li key={ruta}>
                <Link
                  href={ruta}
                  className={`${styles.enlace} ${activo ? styles.activo : ''}`}
                >
                  {etiqueta}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
