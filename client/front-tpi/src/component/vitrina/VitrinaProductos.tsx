"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CardProduct from "../card/card";
import type { Producto } from "@/lib/productos";
import { buscarPromocionAplicable, type Promocion } from "@/lib/promociones";
import styles from "./VitrinaProductos.module.css";

interface VitrinaProductosProps {
  titulo: string;
  productos: Producto[];
  /** Promociones activas — se usan para pintar la cucarda en cada card. */
  promociones?: Promocion[];
  /** Texto cuando la lista viene vacía (backend caído o sin productos). */
  mensajeVacio?: string;
}

const VitrinaProductos = ({
  titulo,
  productos,
  promociones = [],
  mensajeVacio = "No hay productos para mostrar.",
}: VitrinaProductosProps) => {
  const refPista = useRef<HTMLUListElement>(null);
  const [paginaActual, setPaginaActual] = useState(0);
  const [cantidadPaginas, setCantidadPaginas] = useState(1);
  // Evita mismatch SSR/hidratación: los controles del carrusel solo se renderizan
  // post-mount, donde el cálculo de `cantidadPaginas` ya corrió contra el DOM real.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  // Recalcula cuántas "páginas" caben (ancho visible) y en cuál estamos
  const actualizarPaginacion = useCallback(() => {
    const pista = refPista.current;
    if (!pista || pista.clientWidth === 0) return;
    const paginas = Math.max(1, Math.ceil(pista.scrollWidth / pista.clientWidth));
    const actual = Math.round(pista.scrollLeft / pista.clientWidth);
    setCantidadPaginas(paginas);
    setPaginaActual(Math.min(actual, paginas - 1));
  }, []);

  useEffect(() => {
    actualizarPaginacion();
    const pista = refPista.current;
    if (!pista) return;
    pista.addEventListener("scroll", actualizarPaginacion, { passive: true });
    window.addEventListener("resize", actualizarPaginacion);
    return () => {
      pista.removeEventListener("scroll", actualizarPaginacion);
      window.removeEventListener("resize", actualizarPaginacion);
    };
  }, [actualizarPaginacion, productos.length]);

  /** Desplaza la pista a la página indicada. */
  const irAPagina = (indice: number) => {
    const pista = refPista.current;
    if (!pista) return;
    pista.scrollTo({
      left: indice * pista.clientWidth,
      behavior: "smooth",
    });
  };

  const irAnterior = () => irAPagina(Math.max(0, paginaActual - 1));
  const irSiguiente = () =>
    irAPagina(Math.min(cantidadPaginas - 1, paginaActual + 1));

  const enPrimera = paginaActual === 0;
  const enUltima = paginaActual >= cantidadPaginas - 1;

  return (
    <section className={styles.vitrina} aria-label={titulo}>
      <header className={styles.encabezado}>
        <h2 className={styles.titulo}>{titulo}</h2>
      </header>

      {productos.length === 0 ? (
        <p className={styles.vacio}>{mensajeVacio}</p>
      ) : (
        <>
          <div className={styles.contenedor}>
            <ul className={styles.pista} ref={refPista}>
              {productos.map((producto) => (
                <li key={producto.id} className={styles.slot}>
                  <CardProduct
                    itemId={producto.id}
                    title={producto.nombre}
                    precioUnitario={producto.precioUnitario}
                    imageSrc={producto.imagen}
                    categoria={producto.category[0]?.nombre}
                    promocion={buscarPromocionAplicable(producto.id, promociones)}
                    cucarda={producto.cucarda}
                    description={producto.descripcion ?? ""}
                  />
                </li>
              ))}
            </ul>

            {montado && (
              <>
                <button
                  type="button"
                  className={`${styles.flecha} ${styles.flechaIzq}`}
                  onClick={irAnterior}
                  disabled={enPrimera}
                  aria-label="Productos anteriores"
                >
                  &#8249;
                </button>
                <button
                  type="button"
                  className={`${styles.flecha} ${styles.flechaDer}`}
                  onClick={irSiguiente}
                  disabled={enUltima}
                  aria-label="Productos siguientes"
                >
                  &#8250;
                </button>
              </>
            )}
          </div>

          {montado && cantidadPaginas > 1 && (
            <div className={styles.dots}>
              {Array.from({ length: cantidadPaginas }).map((_, indice) => (
                <button
                  key={indice}
                  type="button"
                  className={`${styles.dot}${indice === paginaActual ? ` ${styles.dotActivo}` : ""}`}
                  onClick={() => irAPagina(indice)}
                  aria-label={`Ir a página ${indice + 1}`}
                  aria-current={indice === paginaActual ? "true" : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default VitrinaProductos;
