'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './DashboardSidebar.module.css';

const ENTIDADES = [
  { etiqueta: 'Productos',     ruta: '/dashboard/productos' },
  { etiqueta: 'Categorías',    ruta: '/dashboard/categorias' },
  { etiqueta: 'Promociones',   ruta: '/dashboard/promociones' },
  { etiqueta: 'Slider del home', ruta: '/dashboard/slider' },
];

export default function DashboardSidebar() {
  const rutaActual = usePathname();

  return (
    <aside className={styles.sidebar}>
      <p className={styles.titulo}>Gestión</p>
      <nav>
        <ul className={styles.lista}>
          {ENTIDADES.map(({ etiqueta, ruta }) => {
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
