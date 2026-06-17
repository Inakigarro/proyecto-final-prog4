import Link from "next/link";
import styles from "./AppFooter.module.css";

// Enlaces principales del sitio agrupados para la columna de navegación del footer
const enlacesNavegacion: Array<{ etiqueta: string; ruta: string }> = [
  { etiqueta: "Inicio", ruta: "/" },
  { etiqueta: "Promociones", ruta: "/promociones" },
  { etiqueta: "Quiénes somos", ruta: "/quienes-somos" },
  { etiqueta: "Carrito", ruta: "/carrito" },
  { etiqueta: "Mi perfil", ruta: "/perfil" },
  { etiqueta: "Iniciar sesión", ruta: "/login" },
  { etiqueta: "Registrarse", ruta: "/registro" },
];

// Integrantes del Grupo 6 — TUP FRCU
const integrantes: string[] = [
  "Iñaki Garro",
  "Franco Armando",
  "Rocío Medina",
  "Natalia Medina",
  "Juan Pedro Caffa",
];

const anioActual = new Date().getFullYear();

const AppFooter = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.contenido}>
        <div className={styles.bloque}>
          <span className={styles.marca}>TechPoint</span>
          <p className={styles.descripcion}>
            Proyecto académico de e-commerce desarrollado para la materia
            Programación 4 de la Tecnicatura Universitaria en Programación.
          </p>
        </div>

        <div className={styles.bloque}>
          <span className={styles.titulo}>Navegación</span>
          <ul className={styles.listaEnlaces}>
            {enlacesNavegacion.map(({ etiqueta, ruta }) => (
              <li key={ruta}>
                <Link href={ruta} className={styles.enlace}>
                  {etiqueta}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.bloque}>
          <span className={styles.titulo}>Grupo 6 — TUP FRCU</span>
          <ul className={styles.listaIntegrantes}>
            {integrantes.map((nombre) => (
              <li key={nombre} className={styles.integrante}>
                {nombre}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.barraInferior}>
        <span className={styles.copyright}>
          © {anioActual} TechPoint — Todos los derechos reservados · Grupo 6 del TUP - FRCU
        </span>
      </div>
    </footer>
  );
};

export default AppFooter;
