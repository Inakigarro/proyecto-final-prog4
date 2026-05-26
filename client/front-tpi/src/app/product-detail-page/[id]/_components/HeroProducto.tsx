import styles from "../page.module.css";

const IMAGEN_PLACEHOLDER = "https://placehold.co/600x500?text=Sin+imagen";

interface HeroProductoProps {
  /** Nombre del producto, usado como atributo alt de la imagen. */
  nombre: string;
  /** URL de la imagen principal. Si no se provee, se muestra un placeholder. */
  imageSrc?: string;
  /** Texto promocional superpuesto en la esquina inferior izquierda. */
  cucarda?: string;
}

/**
 * Sección visual izquierda del hero de la PDP.
 *
 * Muestra la imagen principal del producto y, opcionalmente,
 * una cucarda promocional posicionada sobre la imagen.
 * Es un componente presentacional puro: no maneja estado ni efectos.
 */
export default function HeroProducto({ nombre, imageSrc, cucarda }: HeroProductoProps) {
  return (
    <div className={styles.imagenWrapper}>
      <img
        src={imageSrc ?? IMAGEN_PLACEHOLDER}
        alt={nombre}
        className={styles.imagen}
      />

      {cucarda && (
        <span className={styles.cucarda}>{cucarda}</span>
      )}
    </div>
  );
}
