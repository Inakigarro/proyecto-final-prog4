'use client';

import Link from 'next/link';
import styles from './TablaEntidad.module.css';

export interface ColumnaTabla<T> {
  encabezado: string;
  render: (item: T) => React.ReactNode;
}

interface AccionesTabla {
  rutaEditar: (id: string) => string;
  urlVer: (item: Record<string, unknown>) => string;
  onEliminar: (id: string) => void;
}

interface Props<T extends { id: string }> {
  titulo: string;
  rutaNuevo: string;
  labelNuevo: string;
  columnas: ColumnaTabla<T>[];
  datos: T[];
  cargando: boolean;
  pagina: number;
  totalPaginas: number;
  onCambiarPagina: (pagina: number) => void;
  acciones: AccionesTabla;
}

export default function TablaEntidad<T extends { id: string }>({
  titulo,
  rutaNuevo,
  labelNuevo,
  columnas,
  datos,
  cargando,
  pagina,
  totalPaginas,
  onCambiarPagina,
  acciones,
}: Props<T>) {
  return (
    <div className={styles.contenedor}>
      <div className={styles.cabecera}>
        <h1 className={styles.titulo}>{titulo}</h1>
        <Link href={rutaNuevo} className={styles.botonNuevo}>
          + {labelNuevo}
        </Link>
      </div>

      {cargando ? (
        <p className={styles.estado}>Cargando...</p>
      ) : datos.length === 0 ? (
        <p className={styles.estado}>No hay {titulo.toLowerCase()} registrados.</p>
      ) : (
        <div className={styles.tablaWrapper}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                {columnas.map((col) => (
                  <th key={col.encabezado}>{col.encabezado}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((item) => (
                <tr key={item.id}>
                  {columnas.map((col) => (
                    <td key={col.encabezado}>{col.render(item)}</td>
                  ))}
                  <td className={styles.acciones}>
                    <Link
                      href={acciones.rutaEditar(item.id)}
                      className={styles.botonAccion}
                      title="Editar"
                    >
                      Editar
                    </Link>
                    <a
                      href={acciones.urlVer(item as unknown as Record<string, unknown>)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.botonAccion}
                      title="Ver como usuario"
                    >
                      Ver
                    </a>
                    <button
                      type="button"
                      className={`${styles.botonAccion} ${styles.botonEliminar}`}
                      onClick={() => acciones.onEliminar(item.id)}
                      title="Eliminar"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPaginas > 1 && (
        <div className={styles.paginacion}>
          <button
            type="button"
            onClick={() => onCambiarPagina(pagina - 1)}
            disabled={pagina <= 1}
            className={styles.botonPagina}
          >
            ← Anterior
          </button>
          <span className={styles.infoPagina}>Página {pagina} de {totalPaginas}</span>
          <button
            type="button"
            onClick={() => onCambiarPagina(pagina + 1)}
            disabled={pagina >= totalPaginas}
            className={styles.botonPagina}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}
