'use client';

import { useState } from 'react';
import type { UsuarioPerfil } from '@/store/authSlice';
import {
  useCambioPassword,
  validarComplejidadPassword,
} from '../_hooks/useCambioPassword';
import styles from './SeguridadSeccion.module.css';

interface SeguridadSeccionProps {
  usuario: UsuarioPerfil;
}

/**
 * Sección "Seguridad" del perfil.
 *
 * Maneja el cambio de contraseña en dos pasos:
 *  1. El usuario completa contraseña actual + nueva + confirmación.
 *  2. Recibe un código de 6 dígitos por email y lo ingresa para confirmar.
 *
 * Cuando termina, queda visible un mensaje de éxito con la opción de hacer
 * otro cambio.
 */
export default function SeguridadSeccion({ usuario }: SeguridadSeccionProps) {
  const { paso, procesando, error, solicitar, confirmar, reiniciar } = useCambioPassword();

  return (
    <section className={styles.seccion} aria-labelledby="seguridad-titulo">
      <h2 id="seguridad-titulo" className={styles.tituloSeccion}>Seguridad</h2>
      <p className={styles.subtitulo}>
        Cambiá tu contraseña ingresando la actual y verificando el cambio con un código que te llega por email.
      </p>

      {paso === 'inicial' && (
        <FormularioInicial
          procesando={procesando}
          error={error}
          alSolicitar={solicitar}
        />
      )}

      {paso === 'codigo' && (
        <FormularioCodigo
          email={usuario.email}
          procesando={procesando}
          error={error}
          alConfirmar={confirmar}
          alReiniciar={reiniciar}
        />
      )}

      {paso === 'confirmado' && (
        <MensajeExito alReiniciar={reiniciar} />
      )}
    </section>
  );
}

// ── Paso 1: form con password actual + nueva ────────────────────────────────

interface FormularioInicialProps {
  procesando: boolean;
  error: string | null;
  alSolicitar: (passwordActual: string, nuevaPassword: string) => Promise<void>;
}

/**
 * Form del paso inicial. Valida en cliente: complejidad de la nueva password,
 * que coincida con la confirmación y que no sea igual a la actual.
 */
function FormularioInicial({ procesando, error, alSolicitar }: FormularioInicialProps) {
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!passwordActual) {
      setErrorLocal('Ingresá tu contraseña actual.');
      return;
    }
    if (!validarComplejidadPassword(nuevaPassword)) {
      setErrorLocal('La nueva contraseña no cumple los requisitos de complejidad.');
      return;
    }
    if (nuevaPassword !== confirmacion) {
      setErrorLocal('La confirmación no coincide con la nueva contraseña.');
      return;
    }
    if (nuevaPassword === passwordActual) {
      setErrorLocal('La nueva contraseña debe ser distinta a la actual.');
      return;
    }

    try {
      await alSolicitar(passwordActual, nuevaPassword);
    } catch {
      // El error queda en el hook y se muestra abajo
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className={styles.formulario}>
      <div className={styles.campo}>
        <label htmlFor="passwordActual" className={styles.etiqueta}>Contraseña actual</label>
        <input
          id="passwordActual"
          name="passwordActual"
          type="password"
          autoComplete="current-password"
          value={passwordActual}
          onChange={(e) => setPasswordActual(e.target.value)}
          className={styles.input}
          disabled={procesando}
        />
      </div>

      <div className={styles.campo}>
        <label htmlFor="nuevaPassword" className={styles.etiqueta}>Nueva contraseña</label>
        <input
          id="nuevaPassword"
          name="nuevaPassword"
          type="password"
          autoComplete="new-password"
          value={nuevaPassword}
          onChange={(e) => setNuevaPassword(e.target.value)}
          className={styles.input}
          disabled={procesando}
          aria-describedby="reglas-password"
        />
        <p id="reglas-password" className={styles.ayuda}>
          Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo especial.
        </p>
      </div>

      <div className={styles.campo}>
        <label htmlFor="confirmacion" className={styles.etiqueta}>Confirmar nueva contraseña</label>
        <input
          id="confirmacion"
          name="confirmacion"
          type="password"
          autoComplete="new-password"
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          className={styles.input}
          disabled={procesando}
        />
      </div>

      {errorLocal && <p className={styles.error} role="alert">{errorLocal}</p>}
      {error && !errorLocal && <p className={styles.error} role="alert">{error}</p>}

      <button type="submit" className={styles.botonPrimario} disabled={procesando}>
        {procesando ? 'Enviando código…' : 'Enviar código al email'}
      </button>
    </form>
  );
}

// ── Paso 2: input del código ────────────────────────────────────────────────

interface FormularioCodigoProps {
  email: string;
  procesando: boolean;
  error: string | null;
  alConfirmar: (codigo: string) => Promise<void>;
  alReiniciar: () => void;
}

/**
 * Form del paso 2. Mantiene el código en estado local y solo permite tipear
 * dígitos. Habilita el botón cuando se completaron los 6.
 */
function FormularioCodigo({ email, procesando, error, alConfirmar, alReiniciar }: FormularioCodigoProps) {
  const [codigo, setCodigo] = useState('');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  /** Filtra a solo dígitos y limita a 6 caracteres mientras se tipea. */
  const onChangeCodigo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const soloDigitos = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCodigo(soloDigitos);
    setErrorLocal(null);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (codigo.length !== 6) {
      setErrorLocal('El código debe ser de 6 dígitos.');
      return;
    }
    try {
      await alConfirmar(codigo);
    } catch {
      // El error queda en el hook y se muestra abajo
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className={styles.formulario}>
      <p className={styles.aviso}>
        Te enviamos un código de verificación a <strong>{email}</strong>. El código es válido por 5 minutos.
      </p>

      <div className={styles.campo}>
        <label htmlFor="codigo" className={styles.etiqueta}>Código de verificación</label>
        <input
          id="codigo"
          name="codigo"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          value={codigo}
          onChange={onChangeCodigo}
          className={`${styles.input} ${styles.inputCodigo}`}
          disabled={procesando}
          maxLength={6}
        />
      </div>

      {errorLocal && <p className={styles.error} role="alert">{errorLocal}</p>}
      {error && !errorLocal && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.acciones}>
        <button type="submit" className={styles.botonPrimario} disabled={procesando || codigo.length !== 6}>
          {procesando ? 'Confirmando…' : 'Confirmar cambio'}
        </button>
        <button type="button" className={styles.botonSecundario} onClick={alReiniciar} disabled={procesando}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ── Paso 3: confirmación ────────────────────────────────────────────────────

/**
 * Mensaje final tras confirmar el cambio. Ofrece volver al form para que el
 * usuario pueda iniciar otro cambio si quiere.
 */
function MensajeExito({ alReiniciar }: { alReiniciar: () => void }) {
  return (
    <div className={styles.exitoCard}>
      <p className={styles.exitoTitulo}>Listo, cambiamos tu contraseña.</p>
      <p className={styles.exitoSubtitulo}>
        Las sesiones abiertas en otros dispositivos fueron cerradas por seguridad.
      </p>
      <button type="button" className={styles.botonSecundario} onClick={alReiniciar}>
        Hacer otro cambio
      </button>
    </div>
  );
}
