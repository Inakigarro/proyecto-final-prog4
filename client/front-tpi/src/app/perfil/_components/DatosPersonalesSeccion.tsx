'use client';

import { useEffect, useMemo, useState } from 'react';
import type { UsuarioPerfil } from '@/store/authSlice';
import {
  TELEFONO_AR_REGEX,
  useActualizarPerfil,
  type CambiosPerfil,
} from '../_hooks/useActualizarPerfil';
import styles from './DatosPersonalesSeccion.module.css';

interface DatosPersonalesSeccionProps {
  usuario: UsuarioPerfil;
}

/** Forma del formulario en memoria. Todos los campos son strings para enchufarlos al input. */
interface FormState {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono: string;
}

/** Errores de validación por campo. */
type FormErrors = Partial<Record<keyof FormState, string>>;

/**
 * Sección "Datos personales" del perfil.
 *
 * Permite editar nombre, apellido, fecha de nacimiento y teléfono. El email
 * es de solo lectura porque se usa como identificador de login.
 *
 * Las validaciones del cliente replican las del backend para dar feedback
 * inmediato; el backend igualmente vuelve a validar antes de persistir.
 */
export default function DatosPersonalesSeccion({ usuario }: DatosPersonalesSeccionProps) {
  const { guardando, error, exito, guardar } = useActualizarPerfil();

  // Estado inicial derivado del usuario (memo para no rearmar en cada render)
  const valoresIniciales = useMemo<FormState>(
    () => ({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      fechaNacimiento: aFechaInput(usuario.fechaNacimiento),
      telefono: usuario.telefono ?? '',
    }),
    [usuario]
  );

  const [form, setForm] = useState<FormState>(valoresIniciales);
  const [errores, setErrores] = useState<FormErrors>({});

  // Si el usuario cambia desde fuera (refresh de sesión) resincronizamos el form
  useEffect(() => {
    setForm(valoresIniciales);
    setErrores({});
  }, [valoresIniciales]);

  /** Helper para actualizar un campo y limpiar su error mientras el usuario escribe. */
  const actualizar = (campo: keyof FormState, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  // True si al menos un campo difiere del valor original — el botón de guardar
  // solo se habilita cuando realmente hay algo para mandar.
  const hayCambios = (
    form.nombre.trim() !== valoresIniciales.nombre
    || form.apellido.trim() !== valoresIniciales.apellido
    || form.fechaNacimiento !== valoresIniciales.fechaNacimiento
    || form.telefono.trim() !== valoresIniciales.telefono
  );

  /**
   * Valida los campos del form en cliente. Devuelve true si está todo OK.
   * El backend igual valida — esto es solo para feedback inmediato.
   */
  const validar = (): boolean => {
    const nuevos: FormErrors = {};

    if (form.nombre.trim().length < 2) {
      nuevos.nombre = 'El nombre debe tener al menos 2 caracteres.';
    }
    if (form.apellido.trim().length < 2) {
      nuevos.apellido = 'El apellido debe tener al menos 2 caracteres.';
    }
    if (!form.fechaNacimiento) {
      nuevos.fechaNacimiento = 'La fecha de nacimiento es obligatoria.';
    } else if (esFechaFutura(form.fechaNacimiento)) {
      nuevos.fechaNacimiento = 'La fecha no puede ser futura.';
    }
    const telefono = form.telefono.trim();
    if (telefono !== '' && !TELEFONO_AR_REGEX.test(telefono)) {
      nuevos.telefono = 'Formato inválido. Ejemplo: +54 9 11 1234 5678';
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  /** Arma el diff de cambios y dispara el PUT. */
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validar()) return;

    // Solo enviamos los campos que cambiaron para no pisar valores innecesariamente
    const cambios: CambiosPerfil = {};
    if (form.nombre.trim() !== valoresIniciales.nombre) cambios.nombre = form.nombre.trim();
    if (form.apellido.trim() !== valoresIniciales.apellido) cambios.apellido = form.apellido.trim();
    if (form.fechaNacimiento !== valoresIniciales.fechaNacimiento) cambios.fechaNacimiento = form.fechaNacimiento;
    if (form.telefono.trim() !== valoresIniciales.telefono) cambios.telefono = form.telefono.trim();

    try {
      await guardar(cambios);
    } catch {
      // El error queda registrado en el hook y se muestra abajo
    }
  };

  return (
    <section className={styles.seccion} aria-labelledby="datos-personales-titulo">
      <h2 id="datos-personales-titulo" className={styles.tituloSeccion}>Datos personales</h2>
      <p className={styles.subtitulo}>
        Actualizá tus datos cuando quieras. El email no se puede cambiar porque se usa para iniciar sesión.
      </p>

      <form onSubmit={onSubmit} noValidate className={styles.formulario}>
        {/* Email primero — bloqueado para dejar claro de entrada que es solo lectura */}
        <div className={styles.campo}>
          <label htmlFor="email" className={styles.etiqueta}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={usuario.email}
            readOnly
            disabled
            className={`${styles.input} ${styles.inputBloqueado}`}
            aria-describedby="email-leyenda"
          />
          <p id="email-leyenda" className={styles.leyenda}>
            Este dato está validado y por eso no se puede cambiar.
          </p>
        </div>

        <hr className={styles.separador} aria-hidden="true" />

        <div className={styles.fila}>
          <div className={styles.campo}>
            <label htmlFor="nombre" className={styles.etiqueta}>Nombre</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              autoComplete="given-name"
              value={form.nombre}
              onChange={(e) => actualizar('nombre', e.target.value)}
              className={styles.input}
              disabled={guardando}
            />
            {errores.nombre && <p className={styles.error} role="alert">{errores.nombre}</p>}
          </div>

          <div className={styles.campo}>
            <label htmlFor="apellido" className={styles.etiqueta}>Apellido</label>
            <input
              id="apellido"
              name="apellido"
              type="text"
              autoComplete="family-name"
              value={form.apellido}
              onChange={(e) => actualizar('apellido', e.target.value)}
              className={styles.input}
              disabled={guardando}
            />
            {errores.apellido && <p className={styles.error} role="alert">{errores.apellido}</p>}
          </div>
        </div>

        <div className={styles.fila}>
          <div className={styles.campo}>
            <label htmlFor="fechaNacimiento" className={styles.etiqueta}>Fecha de nacimiento</label>
            <input
              id="fechaNacimiento"
              name="fechaNacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={(e) => actualizar('fechaNacimiento', e.target.value)}
              className={styles.input}
              disabled={guardando}
              max={hoyComoFechaInput()}
            />
            {errores.fechaNacimiento && <p className={styles.error} role="alert">{errores.fechaNacimiento}</p>}
          </div>

          <div className={styles.campo}>
            <label htmlFor="telefono" className={styles.etiqueta}>Teléfono</label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+54 9 11 1234 5678"
              value={form.telefono}
              onChange={(e) => actualizar('telefono', e.target.value)}
              className={styles.input}
              disabled={guardando}
            />
            {errores.telefono && <p className={styles.error} role="alert">{errores.telefono}</p>}
          </div>
        </div>

        {error && <p className={styles.errorGeneral} role="alert">{error}</p>}
        {exito && !hayCambios && (
          <p className={styles.mensajeExito} role="status">Datos actualizados correctamente.</p>
        )}

        <button
          type="submit"
          className={styles.botonGuardar}
          disabled={guardando || !hayCambios}
        >
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </section>
  );
}

/**
 * Convierte una fecha ISO recibida del backend a formato yyyy-MM-dd para
 * un <input type="date">. Devuelve string vacío si no hay valor válido.
 */
function aFechaInput(iso: string | undefined): string {
  if (!iso) return '';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  // Usamos la fecha en UTC para no desplazar el día por timezone
  const anio = fecha.getUTCFullYear();
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getUTCDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/** Hoy como yyyy-MM-dd, para usar como `max` del input de fecha de nacimiento. */
function hoyComoFechaInput(): string {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/** True si la fecha yyyy-MM-dd es estrictamente posterior a hoy. */
function esFechaFutura(fechaStr: string): boolean {
  const [anio, mes, dia] = fechaStr.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fecha.getTime() > hoy.getTime();
}
