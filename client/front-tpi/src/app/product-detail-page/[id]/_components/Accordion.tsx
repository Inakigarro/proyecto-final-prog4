"use client";

import { useState } from "react";
import styles from "../page.module.css";

interface AccordionProps {
  /** Texto del encabezado clickeable. */
  titulo: string;
  /** Contenido que se muestra u oculta al hacer click. */
  children: React.ReactNode;
}

/**
 * Sección colapsable con animación de ícono.
 *
 * Gestiona su propio estado de apertura internamente; no requiere
 * control externo. Pensado para usarse en la PDP como bloque de
 * "Descripción", "Especificaciones", etc.
 */
export default function Accordion({ titulo, children }: AccordionProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className={styles.accordion}>
      <button
        className={styles.accordionTrigger}
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
      >
        <span>{titulo}</span>
        <span
          className={`${styles.accordionIcon} ${abierto ? styles.accordionIconAbierto : ""}`}
        >
          ›
        </span>
      </button>

      {abierto && <div className={styles.accordionBody}>{children}</div>}
    </div>
  );
}
