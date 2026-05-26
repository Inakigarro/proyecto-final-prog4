import type { Producto } from "../types";
import SelectorCantidad from "./SelectorCantidad";
import styles from "../page.module.css";

interface PanelInfoProps {
  /** Datos completos del producto a mostrar. */
  producto: Producto;
  /** Cantidad actualmente seleccionada. */
  cantidad: number;
  /** Callback para actualizar la cantidad desde el selector. */
  onCantidadChange: (nuevaCantidad: number) => void;
  /** Callback para el botón "Agregar al carrito". */
  onAgregarAlCarrito: () => void;
  /** Callback para el botón "Comprar ahora". */
  onComprarAhora: () => void;
}

/**
 * Panel derecho del hero de la PDP.
 *
 * Muestra la información comercial del producto:
 * categoría, nombre, precio, selector de cantidad y CTAs principales.
 * Es un componente presentacional que recibe todos sus datos y callbacks
 * desde la página padre.
 */
export default function PanelInfo({
  producto,
  cantidad,
  onCantidadChange,
  onAgregarAlCarrito,
  onComprarAhora,
}: PanelInfoProps) {
  return (
    <div className={styles.infoPanel}>
      {/* Etiqueta de categoría principal */}
      {producto.category[0] && (
        <span className={styles.categoriaLabel}>
          {producto.category[0].nombre}
        </span>
      )}

      <h1 className={styles.titulo}>{producto.nombre}</h1>

      <p className={styles.precio}>
        ${producto.precioUnitario.toLocaleString("es-AR")}
      </p>

      <SelectorCantidad cantidad={cantidad} onChange={onCantidadChange} />

      {/* Botones de acción principales */}
      <div className={styles.ctaBloque}>
        <button className={styles.ctaPrimario} onClick={onAgregarAlCarrito}>
          Agregar al carrito
        </button>
        <button className={styles.ctaSecundario} onClick={onComprarAhora}>
          Comprar ahora
        </button>
      </div>
    </div>
  );
}
