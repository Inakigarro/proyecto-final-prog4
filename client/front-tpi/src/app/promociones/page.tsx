import styles from "./page.module.css";
import Breadcrumb from "@/component/layout/Breadcrumb";
import ListaPromociones from "@/component/promociones/ListaPromociones";
import { obtenerPromociones } from "@/lib/promociones";

export default async function PaginaPromociones() {
  const promociones = await obtenerPromociones();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.contenedor}>
          <Breadcrumb segmentos={[{ etiqueta: "Promociones" }]} />
          <header className={styles.encabezado}>
            <h1 className={styles.titulo}>Promociones</h1>
            <p className={styles.descripcion}>
              Aprovechá nuestras ofertas vigentes.
            </p>
          </header>
          <ListaPromociones
            promociones={promociones}
            mensajeVacio="No pudimos cargar las promociones en este momento."
          />
        </div>
      </main>
    </div>
  );
}
