import { notFound } from "next/navigation";
import styles from "./page.module.css";
import Breadcrumb from "@/component/layout/Breadcrumb";
import ListaResultadosProductos from "@/component/busqueda/ListaResultadosProductos";
import {
  describirPromocion,
  obtenerPromocionPorId,
  obtenerProductosDePromocion,
} from "@/lib/promociones";

interface PaginaDetallePromocionProps {
  params: Promise<{ id: string }>;
}

export default async function PaginaDetallePromocion({
  params,
}: PaginaDetallePromocionProps) {
  const { id } = await params;
  // Fetch en paralelo: la promoción y sus productos no dependen entre sí
  const [promocion, productos] = await Promise.all([
    obtenerPromocionPorId(id),
    obtenerProductosDePromocion(id),
  ]);

  if (!promocion) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.contenedor}>
          <Breadcrumb
            segmentos={[
              { etiqueta: "Promociones", href: "/promociones" },
              { etiqueta: promocion.nombrePromocion },
            ]}
          />
          <header className={styles.encabezado}>
            <span className={styles.badge}>{describirPromocion(promocion)}</span>
            <h1 className={styles.titulo}>{promocion.nombrePromocion}</h1>
          </header>
          <ListaResultadosProductos
            productos={productos}
            promociones={[promocion]}
            mensajeVacio="Esta promoción todavía no tiene productos asociados."
          />
        </div>
      </main>
    </div>
  );
}
