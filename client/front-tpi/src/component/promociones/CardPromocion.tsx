import Link from "next/link";
import { describirPromocion, type Promocion } from "@/lib/promociones";
import styles from "./CardPromocion.module.css";

interface CardPromocionProps {
  promocion: Promocion;
}

const CardPromocion = ({ promocion }: CardPromocionProps) => {
  const cantidadProductos = promocion.idsProductos.length;
  const textoCantidad =
    cantidadProductos === 1 ? "1 producto" : `${cantidadProductos} productos`;

  return (
    <Link
      href={`/promociones/${promocion.idPromocion}`}
      className={styles.card}
      aria-label={`Ver productos de ${promocion.nombrePromocion}`}
    >
      <span className={styles.badge}>{describirPromocion(promocion)}</span>
      <h3 className={styles.titulo}>{promocion.nombrePromocion}</h3>
      <p className={styles.subtitulo}>{textoCantidad}</p>
      <span className={styles.cta}>Ver productos →</span>
    </Link>
  );
};

export default CardPromocion;
