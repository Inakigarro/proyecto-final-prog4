'use client';

import type { PerfilTab } from '../_types';
import styles from './PerfilTabs.module.css';

/**
 * Definición de cada pestaña visible en el navegador de tabs del perfil.
 */
interface TabDef {
  id: PerfilTab;
  label: string;
}

const TABS: TabDef[] = [
  { id: 'datos', label: 'Datos personales' },
  { id: 'direcciones', label: 'Mis direcciones' },
  { id: 'compras', label: 'Mis compras' },
];

interface PerfilTabsProps {
  tabActiva: PerfilTab;
  alCambiar: (tab: PerfilTab) => void;
}

/**
 * Barra de pestañas controlada que ofrece switching entre las secciones del
 * perfil (datos personales, direcciones, compras).
 *
 * Se renderiza con role="tablist" + role="tab" para accesibilidad básica.
 */
export default function PerfilTabs({ tabActiva, alCambiar }: PerfilTabsProps) {
  return (
    <div className={styles.contenedor} role="tablist" aria-label="Secciones del perfil">
      {TABS.map((tab) => {
        const esActiva = tab.id === tabActiva;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={esActiva}
            className={`${styles.tab} ${esActiva ? styles.tabActiva : ''}`}
            onClick={() => alCambiar(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
