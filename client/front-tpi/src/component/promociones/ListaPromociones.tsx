import type { Promocion } from "@/lib/promociones";
import CardPromocion from "./CardPromocion";
import styles from "./ListaPromociones.module.css";

interface ListaPromocionesProps {
  promociones: Promocion[];
  mensajeVacio?: string;
}

const ListaPromociones = ({
  promociones,
  mensajeVacio = "No hay promociones disponibles en este momento.",
}: ListaPromocionesProps) => {
  if (promociones.length === 0) {
    return <p className={styles.vacio}>{mensajeVacio}</p>;
  }

  return (
    <div className={styles.grilla}>
      {promociones.map((promocion) => (
        <CardPromocion key={promocion.idPromocion} promocion={promocion} />
      ))}
    </div>
  );
};

export default ListaPromociones;
