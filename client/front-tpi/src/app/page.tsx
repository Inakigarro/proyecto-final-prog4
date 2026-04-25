import Image from "next/image";
import styles from "./page.module.css";
import CardProduct from "@/component/layout/card/card";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Bienvenido a nuestra tienda</h1>
        <div className={styles.containerPrincipal}>
          <div className={styles.productList}>
            <span>
              <CardProduct />
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
