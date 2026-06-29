import type { Producto } from "../types";
import styles from "../page.module.css";

const IMAGEN_PLACEHOLDER = "https://placehold.co/160x120?text=—";

interface ComparadorProps {
  /** Producto que se está viendo actualmente (siempre va en la primera columna). */
  actual: Producto;
  /** Productos seleccionados desde el slider para comparar con el actual. */
  comparados: Producto[];
  /** Callback para quitar un producto específico de la comparación. */
  onQuitar: (id: string) => void;
  /** Callback para vaciar toda la comparación de una vez. */
  onLimpiar: () => void;
}

/**
 * Devuelve un mapa de atributos comparables para un producto.
 *
 * Centralizar esta función facilita agregar nuevos atributos en el futuro:
 * alcanza con sumar una entrada aquí para que aparezca en todas las filas.
 *
 * @param p - Producto del cual extraer los atributos.
 * @returns Objeto `{ [nombreAtributo]: valorFormateado }`.
 */
function obtenerAtributos(p: Producto): Record<string, string> {
  return {
    Precio: `$${p.precioUnitario.toLocaleString("es-AR")}`,
    Categoría: p.category.map((c) => c.nombre).join(", ") || "—",
  };
}

/**
 * Comparador de productos en formato tabla.
 *
 * Estructura visual:
 * - Fila superior: tarjeta con imagen, nombre y precio de cada producto.
 *   El producto actual se distingue con el tag "Tu producto".
 * - Filas de atributos: una fila por atributo, filas pares con fondo alternado.
 *
 * El grid se ajusta dinámicamente al número de productos usando la variable
 * CSS `--col-count`, evitando lógica condicional en el CSS.
 * La tabla es scrolleable horizontalmente en pantallas pequeñas.
 */
export default function Comparador({ actual, comparados, onQuitar, onLimpiar }: ComparadorProps) {
  const todos = [actual, ...comparados];
  const atributos = Object.keys(obtenerAtributos(actual));

  /** Variable CSS que le indica al grid cuántas columnas de producto renderizar. */
  const gridStyle = { "--col-count": todos.length } as React.CSSProperties;

  return (
    <div className={styles.comparadorWrapper}>

      {/* Encabezado con título y acción de limpiar */}
      <div className={styles.comparadorHeader}>
        <h2 className={styles.comparadorTitulo}>Comparar productos</h2>
        <button className={styles.comparadorLimpiar} onClick={onLimpiar}>
          Limpiar comparación
        </button>
      </div>

      <div className={styles.comparadorTabla}>

        {/* ── Fila de tarjetas de producto ── */}
        <div className={styles.comparadorFila} style={gridStyle}>
          {/* Celda vacía que ocupa el espacio de la columna de atributos */}
          <div className={styles.comparadorCeldaAtributo} />

          {todos.map((p) => {
            const esActual = p.id === actual.id;
            return (
              <div key={p.id} className={styles.comparadorCeldaProducto}>
                {esActual && (
                  <span className={styles.comparadorTagActual}>Tu producto</span>
                )}

                <div className={styles.comparadorImagenWrapper}>
                  <img
                    src={p.imagen ?? IMAGEN_PLACEHOLDER}
                    alt={p.nombre}
                    className={styles.comparadorImagen}
                  />
                </div>

                <p className={styles.comparadorNombre}>{p.nombre}</p>
                <p className={styles.comparadorPrecio}>
                  ${p.precioUnitario.toLocaleString("es-AR")}
                </p>

                {!esActual && (
                  <button
                    className={styles.comparadorQuitar}
                    onClick={() => onQuitar(p.id)}
                    aria-label={`Quitar ${p.nombre} de la comparación`}
                  >
                    ✕ Quitar
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Filas de atributos ── */}
        {atributos.map((attr, i) => (
          <div
            key={attr}
            className={`${styles.comparadorFila} ${i % 2 === 0 ? styles.comparadorFilaPar : ""}`}
            style={gridStyle}
          >
            <div className={styles.comparadorCeldaAtributo}>{attr}</div>

            {todos.map((p) => (
              <div key={p.id} className={styles.comparadorCeldaValor}>
                {obtenerAtributos(p)[attr] ?? "—"}
              </div>
            ))}
          </div>
        ))}

      </div>
    </div>
  );
}
