import Link from "next/link";
import styles from "./Breadcrumb.module.css";

interface Segmento {
  etiqueta: string;
  href?: string;
}

interface BreadcrumbProps {
  segmentos: Segmento[];
}

export default function Breadcrumb({ segmentos }: BreadcrumbProps) {
  return (
    <nav aria-label="Ruta de navegación" className={styles.breadcrumb}>
      <ol className={styles.lista}>
        <li className={styles.item}>
          <Link href="/" className={styles.enlace}>Inicio</Link>
        </li>
        {segmentos.map((seg, i) => (
          <li key={i} className={styles.item}>
            <span className={styles.separador} aria-hidden="true">›</span>
            {seg.href ? (
              <Link href={seg.href} className={styles.enlace}>{seg.etiqueta}</Link>
            ) : (
              <span className={styles.actual} aria-current="page">{seg.etiqueta}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
