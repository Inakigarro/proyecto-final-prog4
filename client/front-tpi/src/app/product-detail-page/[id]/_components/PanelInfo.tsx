import type { Producto } from "../types";
import SelectorCantidad from "./SelectorCantidad";
import { calcularDescuentoItem, type Promocion } from "@/lib/promociones";
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
  /**
   * Promoción aplicable al producto. Si es DESCUENTO_PORCENTUAL,
   * el precio se renderiza tachado + precio con descuento debajo.
   */
  promocion?: Promocion;
}

/**
 * Panel derecho del hero de la PDP.
 *
 * Muestra la información comercial del producto:
 * categoría, nombre, precio, selector de cantidad y CTAs principales.
 * Si recibe una promoción de tipo PORCENTUAL, pinta precio tachado + nuevo.
 */
export default function PanelInfo({
  producto,
  cantidad,
  onCantidadChange,
  onAgregarAlCarrito,
  onComprarAhora,
  promocion,
}: PanelInfoProps) {
  // Para PORCENTUAL devuelve precioUnitarioConDescuento; para NXM/2da no
  const calculoDescuento = promocion
    ? calcularDescuentoItem(producto.precioUnitario, 1, promocion)
    : undefined;
  const precioConDescuento = calculoDescuento?.precioUnitarioConDescuento;
  const hayPrecioTachado = precioConDescuento !== undefined;

  return (
    <div className={styles.infoPanel}>
      {/* Etiqueta de categoría principal */}
      {producto.category[0] && (
        <span className={styles.categoriaLabel}>
          {producto.category[0].nombre}
        </span>
      )}

      <h1 className={styles.titulo}>{producto.nombre}</h1>

      {hayPrecioTachado ? (
        <div className={styles.bloquePrecio}>
          <span className={styles.precioTachado}>
            ${producto.precioUnitario.toLocaleString("es-AR")}
          </span>
          <span className={`${styles.precio} ${styles.precioDescuento}`}>
            ${precioConDescuento.toLocaleString("es-AR")}
          </span>
        </div>
      ) : (
        <p className={styles.precio}>
          ${producto.precioUnitario.toLocaleString("es-AR")}
        </p>
      )}

      {/* Chip de stock — solo se muestra si el campo llegó del backend */}
      {producto.stock !== undefined && (
        <p className={
          producto.stock === 0
            ? styles.stockAgotado
            : producto.stock <= 5
              ? styles.stockBajo
              : styles.stockDisponible
        }>
          {producto.stock === 0
            ? 'Sin stock'
            : producto.stock <= 5
              ? `¡Últimas ${producto.stock} unidades!`
              : `Stock disponible: ${producto.stock}`}
        </p>
      )}

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
