"use client";

import CardProduct from "../card/card";
import type { Producto } from "@/lib/productos";
import styles from "./ListaResultadosProductos.module.css";

interface ListaResultadosProductosProps {
  productos: Producto[];
  mensajeVacio?: string;
}

const ListaResultadosProductos = ({
  productos,
  mensajeVacio = "No se encontraron productos.",
}: ListaResultadosProductosProps) => {
  if (productos.length === 0) {
    return <p className={styles.vacio}>{mensajeVacio}</p>;
  }

  return (
    <div className={styles.grilla}>
      {productos.map((producto) => (
        <CardProduct
          key={producto.id}
          itemId={producto.id}
          title={producto.nombre}
          precioUnitario={producto.precioUnitario}
          imageSrc={producto.imageSrc}
          categoria={producto.category[0]?.nombre}
          cucarda={producto.cucarda}
          description={producto.descripcion ?? ""}
        />
      ))}
    </div>
  );
};

export default ListaResultadosProductos;
