'use client';

import { useEffect, useState } from 'react';
import type { UsuarioPerfil } from '@/store/authSlice';
import { TELEFONO_AR_REGEX, useActualizarTelefono } from '../_hooks/useActualizarTelefono';
import styles from './DatosPersonalesSeccion.module.css';

interface DatosPersonalesSeccionProps {
  usuario: UsuarioPerfil;
}

/**
 * Sección "Datos personales" del perfil.
 *
 * Muestra nombre, apellido, email y fecha de nacimiento como datos de solo
 * lectura, y permite editar únicamente el teléfono.
 *
 * La validación del teléfono replica la regex AR del backend para dar feedback
 * inmediato; el backend igualmente vuelve a validar antes de persistir.
 */
export default function DatosPersonalesSeccion({ usuario }: DatosPersonalesSeccionProps) {
  const { guardando, error, exito, guardar } = useActualizarTelefono();
  const [telefono, setTelefono] = useState(usuario.telefono ?? '');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Sincronizar el input si el usuario cambia desde fuera (p.ej. refresh de sesión)
  useEffect(() => {
    setTelefono(usuario.telefono ?? '');
  }, [usuario.telefono]);

  const hayCambios = telefono.trim() !== (usuario.telefono ?? '');

  /** Valida localmente y guarda si pasa. El backend también valida. */
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const valor = telefono.trim();

    // Aceptamos vacío (sin teléfono) o un valor que matchee el formato AR
    if (valor !== '' && !TELEFONO_AR_REGEX.test(valor)) {
      setErrorLocal('Formato inválido. Ejemplo: +54 9 11 1234 5678');
      return;
    }

    setErrorLocal(null);
    try {
      await guardar(valor);
    } catch {
      // El error real ya queda registrado en el hook; no hace falta volver a setear
    }
  };

  return (
    <section className={styles.seccion} aria-labelledby="datos-personales-titulo">
      <h2 id="datos-personales-titulo" className={styles.tituloSeccion}>Datos personales</h2>
      <p className={styles.subtitulo}>
        Tus datos básicos son de solo lectura. Para modificarlos contactá al administrador.
      </p>

      <dl className={styles.lista}>
        <div className={styles.item}>
          <dt className={styles.etiqueta}>Nombre</dt>
          <dd className={styles.valor}>{usuario.nombre}</dd>
        </div>
        <div className={styles.item}>
          <dt className={styles.etiqueta}>Apellido</dt>
          <dd className={styles.valor}>{usuario.apellido}</dd>
        </div>
        <div className={styles.item}>
          <dt className={styles.etiqueta}>Email</dt>
          <dd className={styles.valor}>{usuario.email}</dd>
        </div>
        <div className={styles.item}>
          <dt className={styles.etiqueta}>Fecha de nacimiento</dt>
          <dd className={styles.valor}>{formatearFecha(usuario.fechaNacimiento)}</dd>
        </div>
      </dl>

      <form onSubmit={onSubmit} noValidate className={styles.formulario}>
        <div className={styles.campo}>
          <label htmlFor="telefono" className={styles.etiqueta}>Teléfono</label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+54 9 11 1234 5678"
            value={telefono}
            onChange={(e) => {
              setTelefono(e.target.value);
              setErrorLocal(null);
            }}
            className={styles.input}
            disabled={guardando}
          />
          {errorLocal && <p className={styles.error} role="alert">{errorLocal}</p>}
          {error && !errorLocal && <p className={styles.error} role="alert">{error}</p>}
          {exito && !hayCambios && (
            <p className={styles.mensajeExito} role="status">Teléfono actualizado correctamente.</p>
          )}
        </div>

        <button
          type="submit"
          className={styles.botonGuardar}
          disabled={guardando || !hayCambios}
        >
          {guardando ? 'Guardando…' : 'Guardar teléfono'}
        </button>
      </form>
    </section>
  );
}

/**
 * Convierte una fecha en string ISO (o undefined) a un formato legible en
 * español. Si no hay valor o es inválido, devuelve un guion.
 */
function formatearFecha(iso: string | undefined): string {
  if (!iso) return '—';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';
  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
