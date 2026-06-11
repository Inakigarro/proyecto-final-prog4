"use client";

import { useEffect, useRef, useState } from "react";
import CardProduct from "@/component/card/card";
import { buscarPromocionAplicable, type Promocion } from "@/lib/promociones";
import type { Producto } from "../types";
import styles from "../page.module.css";

interface RelatedSliderProps {
  /** Lista de productos relacionados a mostrar en el slider. */
  productos: Producto[];
  /** IDs de los productos actualmente seleccionados en el comparador. */
  productosComparados: string[];
  /** Cantidad máxima de productos que se pueden comparar simultáneamente. */
  maxComparados: number;
  /** Callback al hacer click en "Comparar" de una card. */
  onToggleComparar: (producto: Producto) => void;
  /** Promociones activas — se usan para derivar la cucarda de cada card. */
  promociones?: Promocion[];
}

/**
 * Slider horizontal de productos relacionados.
 *
 * Comportamiento:
 * - Scroll horizontal con snap por ítem.
 * - Flechas de navegación que solo se muestran cuando el contenido
 *   desborda el contenedor (detectado con ResizeObserver).
 * - Debajo de cada card hay un botón "Comparar" que se activa/desactiva
 *   y se deshabilita cuando se alcanzó el límite del comparador.
 */
export default function RelatedSlider({
  productos,
  productosComparados,
  maxComparados,
  onToggleComparar,
  promociones = [],
}: RelatedSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [mostrarFlechas, setMostrarFlechas] = useState(false);

  /**
   * Observa el track con ResizeObserver para mostrar u ocultar las flechas
   * según si el contenido desborda el ancho visible.
   * Se re-ejecuta cuando cambia la lista de productos.
   */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const verificar = () => setMostrarFlechas(el.scrollWidth > el.clientWidth);
    verificar();

    const observer = new ResizeObserver(verificar);
    observer.observe(el);
    return () => observer.disconnect();
  }, [productos]);

  /** Desplaza el track la cantidad de píxeles indicada. */
  const scroll = (dir: "izq" | "der") => {
    trackRef.current?.scrollBy({ left: dir === "der" ? 320 : -320, behavior: "smooth" });
  };

  return (
    <div className={styles.sliderContainer}>
      {mostrarFlechas && (
        <button
          className={`${styles.sliderArrow} ${styles.sliderArrowIzq}`}
          onClick={() => scroll("izq")}
          aria-label="Desplazar a la izquierda"
        >
          ‹
        </button>
      )}

      <div className={styles.sliderTrack} ref={trackRef}>
        {productos.map((producto) => {
          const comparando = productosComparados.includes(producto.id);
          const limiteAlcanzado =
            productosComparados.length >= maxComparados && !comparando;
          const promocionAplicable = buscarPromocionAplicable(producto.id, promociones);

          return (
            <div key={producto.id} className={styles.sliderItem}>
              <CardProduct
                itemId={producto.id}
                title={producto.nombre}
                precioUnitario={producto.precioUnitario}
                imageSrc={producto.imageSrc}
                categoria={producto.category[0]?.nombre}
                promocion={promocionAplicable}
                cucarda={producto.cucarda}
              />

              <button
                className={`
                  ${styles.compararBtn}
                  ${comparando ? styles.compararBtnActivo : ""}
                  ${limiteAlcanzado ? styles.compararBtnDisabled : ""}
                `.trim()}
                onClick={() => !limiteAlcanzado && onToggleComparar(producto)}
                disabled={limiteAlcanzado}
                title={limiteAlcanzado ? `Máximo ${maxComparados} productos` : undefined}
              >
                {comparando ? "✓ Comparando" : "Comparar"}
              </button>
            </div>
          );
        })}
      </div>

      {mostrarFlechas && (
        <button
          className={`${styles.sliderArrow} ${styles.sliderArrowDer}`}
          onClick={() => scroll("der")}
          aria-label="Desplazar a la derecha"
        >
          ›
        </button>
      )}
    </div>
  );
}
