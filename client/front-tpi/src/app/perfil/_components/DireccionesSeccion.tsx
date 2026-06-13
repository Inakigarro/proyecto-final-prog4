'use client';

import { useState } from 'react';
import ConfirmDialog from '@/component/cart/ConfirmDialog';
import { useDirecciones } from '../_hooks/useDirecciones';
import TarjetaDireccion from './TarjetaDireccion';
import styles from './DireccionesSeccion.module.css';

interface DireccionesSeccionProps {
  /** True cuando la sesión está hidratada y se puede llamar al backend */
  habilitado: boolean;
}

/**
 * Sección "Mis direcciones" del perfil.
 *
 * Muestra las direcciones del usuario en tarjetas y permite eliminarlas con
 * un modal de confirmación reusable. No soporta agregar ni editar (decisión
 * del producto: el alta se hará en el flujo de checkout).
 */
export default function DireccionesSeccion({ habilitado }: DireccionesSeccionProps) {
  const { direcciones, cargando, error, eliminar } = useDirecciones(habilitado);

  // Id de la dirección que el usuario seleccionó para eliminar (controla el modal)
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  /** Cierra el modal de confirmación sin hacer nada. */
  const cancelarEliminacion = () => setIdAEliminar(null);

  /** Confirma la eliminación: dispara el DELETE y maneja errores silenciosamente. */
  const confirmarEliminacion = async () => {
    if (!idAEliminar) return;
    const id = idAEliminar;
    setIdAEliminar(null);
    setEliminandoId(id);
    try {
      await eliminar(id);
    } catch {
      // El hook ya almacenó el error en el estado para mostrarlo en la UI
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <section className={styles.seccion} aria-labelledby="direcciones-titulo">
      <h2 id="direcciones-titulo" className={styles.tituloSeccion}>Mis direcciones</h2>
      <p className={styles.subtitulo}>
        Estas son las direcciones guardadas en tu cuenta. Solo podés eliminarlas.
      </p>

      {error && <p className={styles.errorGeneral} role="alert">{error}</p>}

      {cargando && <p className={styles.mensajeNeutro}>Cargando direcciones…</p>}

      {!cargando && direcciones.length === 0 && !error && (
        <div className={styles.estadoVacio}>
          <p>Todavía no tenés direcciones guardadas.</p>
        </div>
      )}

      {!cargando && direcciones.length > 0 && (
        <ul className={styles.lista}>
          {direcciones.map((direccion) => (
            <li key={direccion.id} className={styles.itemLista}>
              <TarjetaDireccion
                direccion={direccion}
                eliminando={eliminandoId === direccion.id}
                alEliminar={() => setIdAEliminar(direccion.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        abierto={idAEliminar !== null}
        titulo="Eliminar dirección"
        mensaje="¿Seguro que querés eliminar esta dirección? No vas a poder recuperarla."
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
        destructivo
        onConfirmar={confirmarEliminacion}
        onCancelar={cancelarEliminacion}
      />
    </section>
  );
}
