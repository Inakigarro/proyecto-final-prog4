import styles from "./page.module.css";
import Breadcrumb from "@/component/layout/Breadcrumb";
import IntegranteCard from "./_components/IntegranteCard";

/**
 * Lista de integrantes del equipo en el orden en que se presentan.
 * Solo el nombre completo — sin legajo ni rol para mantenerlo austero.
 */
const integrantes: ReadonlyArray<string> = [
  "Rocío Medina",
  "Iñaki Garro",
  "Natalia Medina",
  "Franco Armando",
  "Caffa Juan Pedro",
];

/**
 * Página institucional "Quiénes somos".
 *
 * Cuenta que el sitio es un proyecto final de carrera de la Tecnicatura
 * Universitaria en Programación de la UTN FRCU, y lista a los integrantes
 * del equipo. Es estática: sin fetch ni estado, por eso queda como Server
 * Component sin "use client".
 */
export default function PaginaQuienesSomos() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.contenedor}>
          <Breadcrumb segmentos={[{ etiqueta: "Quiénes somos" }]} />

          <header className={styles.encabezado}>
            <h1 className={styles.titulo}>Quiénes somos</h1>
            <p className={styles.descripcion}>
              Somos alumnos de la <strong>Tecnicatura Universitaria en
              Programación</strong> de la <strong>UTN — Facultad Regional
              Concepción del Uruguay (FRCU)</strong>. Este sitio es nuestro
              proyecto final de carrera.
            </p>
          </header>

          <section className={styles.seccionIntegrantes}>
            <h2 className={styles.subtitulo}>Integrantes</h2>
            <div className={styles.grilla}>
              {integrantes.map((nombre) => (
                <IntegranteCard key={nombre} nombre={nombre} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
