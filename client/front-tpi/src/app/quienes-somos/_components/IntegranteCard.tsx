import styles from "./IntegranteCard.module.css";

/**
 * Props de la tarjeta de integrante.
 */
interface IntegranteCardProps {
  /** Nombre completo del integrante a mostrar. */
  nombre: string;
}

/**
 * Tarjeta individual para presentar un integrante del equipo.
 * Muestra las iniciales en un círculo y el nombre debajo.
 * Pensada para usarse dentro de una grilla en la página /quienes-somos.
 */
const IntegranteCard = ({ nombre }: IntegranteCardProps) => {
  const iniciales = obtenerIniciales(nombre);

  return (
    <article className={styles.card}>
      <div className={styles.avatar} aria-hidden="true">
        {iniciales}
      </div>
      <p className={styles.nombre}>{nombre}</p>
    </article>
  );
};

/**
 * Devuelve las iniciales del nombre completo: primera letra del primer
 * y último token separado por espacios. Si el nombre tiene una sola palabra,
 * devuelve esa única inicial.
 */
function obtenerIniciales(nombre: string): string {
  const tokens = nombre.trim().split(/\s+/);
  if (tokens.length === 1) return tokens[0]!.charAt(0).toUpperCase();
  const primera = tokens[0]!.charAt(0);
  const ultima = tokens[tokens.length - 1]!.charAt(0);
  return `${primera}${ultima}`.toUpperCase();
}

export default IntegranteCard;
