"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./MenuMovilDrawer.module.css";
import { urlBusquedaPorCategoria, type Categoria } from "./hooks/useCategorias";

export interface EnlacePrincipal {
  etiqueta: string;
  ruta: string;
}

interface MenuMovilDrawerProps {
  categorias: Categoria[];
  enlaces: EnlacePrincipal[];
}

const MenuMovilDrawer = ({ categorias, enlaces }: MenuMovilDrawerProps) => {
  const rutaActual = usePathname();
  const [abierto, setAbierto] = useState(false);

  // Cierra el drawer al cambiar de ruta
  useEffect(() => {
    setAbierto(false);
  }, [rutaActual]);

  const cerrar = () => setAbierto(false);

  return (
    <>
      <button
        type="button"
        className={styles.botonHamburguesa}
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={abierto}
        onClick={() => setAbierto((previo) => !previo)}
      >
        <span className={styles.icono} aria-hidden="true">
          {abierto ? "✕" : "☰"}
        </span>
      </button>

      {abierto && (
        <>
          <div className={styles.overlay} onClick={cerrar} aria-hidden="true" />
          <aside className={styles.drawer} aria-label="Menú principal">
            <section className={styles.seccion}>
              <h3 className={styles.titulo}>Categorías</h3>
              {categorias.length === 0 ? (
                <p className={styles.vacio}>Sin categorías</p>
              ) : (
                <ul className={styles.lista}>
                  {categorias.map((categoria) => (
                    <li key={categoria.id}>
                      <Link
                        href={urlBusquedaPorCategoria(categoria.nombre)}
                        className={styles.enlace}
                      >
                        {categoria.nombre}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={styles.seccion}>
              <h3 className={styles.titulo}>Navegación</h3>
              <ul className={styles.lista}>
                {enlaces.map(({ etiqueta, ruta }) => (
                  <li key={ruta}>
                    <Link
                      href={ruta}
                      className={`${styles.enlace}${rutaActual === ruta ? ` ${styles.activo}` : ""}`}
                    >
                      {etiqueta}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </>
      )}
    </>
  );
};

export default MenuMovilDrawer;
