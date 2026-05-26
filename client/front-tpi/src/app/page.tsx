import styles from "./page.module.css";
import Slider, { Slide } from "@/component/slider/Slider";

const slides: Slide[] = [
  {
    src: "https://via.placeholder.com/1660x480?text=Slide+1",
    alt: "Slide 1",
    caption: "Las mejores ofertas en tecnología",
  },
  {
    src: "https://via.placeholder.com/1660x480?text=Slide+2",
    alt: "Slide 2",
    caption: "Nuevos productos disponibles",
  },
  {
    src: "https://via.placeholder.com/1660x480?text=Slide+3",
    alt: "Slide 3",
    caption: "Envío gratis en compras mayores a $50.000",
  },
];

const infoCards = [
  {
    icon: "🚚",
    titulo: "Envío a todo el país",
    descripcion: "Despachamos a cualquier punto del país con seguimiento en tiempo real.",
  },
  {
    icon: "🛡️",
    titulo: "Garantía oficial",
    descripcion: "Todos nuestros productos cuentan con garantía oficial del fabricante.",
  },
  {
    icon: "💬",
    titulo: "Soporte 24/7",
    descripcion: "Nuestro equipo está disponible todos los días para ayudarte.",
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
          <Slider slides={slides} />

          <section className={styles.infoCards}>
            {infoCards.map((card) => (
              <article key={card.titulo} className={styles.infoCard}>
                <span className={styles.infoIcon}>{card.icon}</span>
                <h3 className={styles.infoTitulo}>{card.titulo}</h3>
                <p className={styles.infoDescripcion}>{card.descripcion}</p>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}