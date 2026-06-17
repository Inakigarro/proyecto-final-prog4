"use client";

import CardProduct from "../card/card";
import type { Producto } from "@/lib/productos";
import { buscarPromocionAplicable, type Promocion } from "@/lib/promociones";
import styles from "./ListaResultadosProductos.module.css";

interface ListaResultadosProductosProps {
  productos: Producto[];
  /** Promociones activas — se usan para pintar la cucarda en cada card. */
  promociones?: Promocion[];
  mensajeVacio?: string;
}

const ListaResultadosProductos = ({
  productos,
  promociones = [],
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
          imageSrc={producto.imagen}
          categoria={producto.category[0]?.nombre}
          stock={producto.stock}
          promocion={buscarPromocionAplicable(producto.id, promociones)}
          cucarda={producto.cucarda}
          description={producto.descripcion ?? ""}
        />
      ))}
    </div>
  );
};

export default ListaResultadosProductos;
