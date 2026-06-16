"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./CategoriasMenu.module.css";
import { urlBusquedaPorCategoria, type Categoria } from "./hooks/useCategorias";

interface CategoriasMenuProps {
  categorias: Categoria[];
}

const CategoriasMenu = ({ categorias }: CategoriasMenuProps) => {
  const [abierto, setAbierto] = useState(false);
  const refDropdownCategorias = useRef<HTMLDivElement>(null);

  // Cierra el dropdown al hacer click fuera del contenedor
  useEffect(() => {
    if (!abierto) return;
    const cerrarSiClickAfuera = (evento: MouseEvent) => {
      if (
        refDropdownCategorias.current &&
        !refDropdownCategorias.current.contains(evento.target as Node)
      ) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", cerrarSiClickAfuera);
    return () => document.removeEventListener("mousedown", cerrarSiClickAfuera);
  }, [abierto]);

  return (
    <div className={styles.contenedor} ref={refDropdownCategorias}>
      <button
        type="button"
        className={`${styles.boton}${abierto ? ` ${styles.activo}` : ""}`}
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((previo) => !previo)}
      >
        Categorías
        <span className={styles.flecha} aria-hidden="true">▾</span>
      </button>
      {abierto && (
        <ul className={styles.panel} role="menu">
          {categorias.length === 0 ? (
            <li className={styles.vacio}>Sin categorías</li>
          ) : (
            categorias.map((categoria) => (
              <li key={categoria.id} role="none">
                <Link
                  role="menuitem"
                  href={urlBusquedaPorCategoria(categoria.nombre)}
                  className={styles.enlace}
                  onClick={() => setAbierto(false)}
                >
                  {categoria.nombre}
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default CategoriasMenu;
