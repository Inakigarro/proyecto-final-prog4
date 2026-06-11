import styles from "../page.module.css";

interface SelectorCantidadProps {
  /** Valor actual de la cantidad seleccionada. */
  cantidad: number;
  /** Callback que recibe el nuevo valor al cambiar la cantidad. */
  onChange: (nuevaCantidad: number) => void;
  /** Cantidad mínima permitida. Por defecto: 1. */
  min?: number;
  /** Cantidad máxima permitida. Sin límite por defecto. */
  max?: number;
}

/**
 * Stepper de cantidad: botones − y + con valor numérico en el centro.
 *
 * Controla los límites mínimo/máximo deshabilitando los botones
 * correspondientes. El componente es controlado: el estado vive
 * en el padre y se actualiza a través de `onChange`.
 */
export default function SelectorCantidad({
  cantidad,
  onChange,
  min = 1,
  max,
}: SelectorCantidadProps) {
  const puedeDecrementar = cantidad > min;
  const puedeIncrementar = max === undefined || cantidad < max;

  return (
    <div className={styles.cantidadBloque}>
      <span className={styles.cantidadLabel}>Cantidad</span>

      <div className={styles.selectorCantidad}>
        <button
          className={styles.cantidadBtn}
          onClick={() => onChange(Math.max(min, cantidad - 1))}
          disabled={!puedeDecrementar}
          aria-label="Reducir cantidad"
        >
          −
        </button>

        <span className={styles.cantidadValor} aria-live="polite">
          {cantidad}
        </span>

        <button
          className={styles.cantidadBtn}
          onClick={() => onChange(cantidad + 1)}
          disabled={!puedeIncrementar}
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
    </div>
  );
}
