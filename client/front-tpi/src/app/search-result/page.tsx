"use client";

import styles from "./page.module.css";
import Breadcrumb from "@/component/layout/Breadcrumb";
import ListaResultadosProductos from "@/component/busqueda/ListaResultadosProductos";
import { useResultadosBusqueda } from "@/component/busqueda/useResultadosBusqueda";

const PaginaResultadosBusqueda = () => {
  const { productos, promociones, cargando, mensajeError, tipoBusqueda, termino } =
    useResultadosBusqueda();

  // Etiqueta de breadcrumb y título según el tipo de búsqueda
  const etiquetaBreadcrumb =
    tipoBusqueda === "categoria"
      ? `Categoría: ${termino}`
      : tipoBusqueda === "texto"
        ? `"${termino}"`
        : "Todos los productos";

  const tituloPagina =
    tipoBusqueda === "categoria"
      ? `Categoría: ${termino}`
      : tipoBusqueda === "texto"
        ? `Resultados para: "${termino}"`
        : "Todos los productos";

  if (cargando) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <h1>Cargando productos...</h1>
        </main>
      </div>
    );
  }

  if (mensajeError) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <h1>Error: {mensajeError}</h1>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.containerPrincipal}>
          <Breadcrumb segmentos={[{ etiqueta: etiquetaBreadcrumb }]} />
          <h2>{tituloPagina}</h2>
          <ListaResultadosProductos productos={productos} promociones={promociones} />
        </div>
      </main>
    </div>
  );
};

export default PaginaResultadosBusqueda;
