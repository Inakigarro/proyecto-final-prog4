'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

const REQUISITOS_PASSWORD = [
  { label: 'Mínimo 8 caracteres',  check: (p: string) => p.length >= 8 },
  { label: 'Una letra mayúscula',  check: (p: string) => /[A-Z]/.test(p) },
  { label: 'Una letra minúscula',  check: (p: string) => /[a-z]/.test(p) },
  { label: 'Un número',            check: (p: string) => /[0-9]/.test(p) },
  { label: 'Un símbolo especial',  check: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

function validarPassword(p: string): boolean {
  return REQUISITOS_PASSWORD.every(({ check }) => check(p));
}

// ── Vista 1: solicitar reset por email ────────────────────────────────────────

function FormSolicitud() {
  const { solicitarReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) { setError('El email es obligatorio.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Ingresá un email válido.'); return; }

    setCargando(true);
    try {
      await solicitarReset(email.trim());
      setEnviado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el email. Intentá de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  if (enviado) {
    return (
      <div className={styles.contenedor}>
        <h1 className={styles.titulo}>Revisá tu email</h1>
        <p className={styles.confirmacion}>
          Si existe una cuenta asociada a <strong>{email}</strong>, te enviamos un enlace para
          restablecer tu contraseña. Revisá también la carpeta de spam.
        </p>
        <p className={styles.confirmacionSub}>El enlace expira en 1 hora.</p>
      </div>
    );
  }

  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>¿Olvidaste tu contraseña?</h1>
      <p className={styles.descripcion}>
        Ingresá tu email y te enviaremos un enlace para crear una nueva contraseña.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        {error && <p className={styles.errorGeneral} role="alert">{error}</p>}

        <div className={styles.campo}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="tu@email.com"
            autoComplete="email"
          />
        </div>

        <button type="submit" className={styles.botonSubmit} disabled={cargando}>
          {cargando ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>
    </div>
  );
}

// ── Vista 2: nueva contraseña (token en URL) ──────────────────────────────────

function FormNuevaPassword() {
  const { resetearPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [form, setForm] = useState({ password: '', confirmar: '' });
  const [errors, setErrors] = useState<{ password?: string; confirmar?: string; general?: string }>({});
  const [cargando, setCargando] = useState(false);

  const actualizar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const validar = (): boolean => {
    const nuevos: typeof errors = {};
    if (!form.password) {
      nuevos.password = 'La contraseña es obligatoria.';
    } else if (!validarPassword(form.password)) {
      nuevos.password = '';
    }
    if (form.password !== form.confirmar) {
      nuevos.confirmar = 'Las contraseñas no coinciden.';
    }
    setErrors(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validar()) return;

    setCargando(true);
    try {
      await resetearPassword(token, form.password);
      router.push('/');
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Error al restablecer la contraseña.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>Nueva contraseña</h1>

      <form onSubmit={handleSubmit} noValidate>
        {errors.general && (
          <p className={styles.errorGeneral} role="alert">{errors.general}</p>
        )}

        <div className={styles.campo}>
          <label htmlFor="password">Nueva contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={actualizar}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            aria-describedby="requisitos-password"
          />
          {form.password.length > 0 && (
            <ul
              id="requisitos-password"
              className={styles.requisitos}
              aria-label="Requisitos de la contraseña"
            >
              {REQUISITOS_PASSWORD.map(({ label, check }) => {
                const cumplido = check(form.password);
                return (
                  <li key={label} className={cumplido ? styles.requisitoCumplido : styles.requisitoFaltante}>
                    <span aria-hidden="true">{cumplido ? '✓' : '✗'}</span> {label}
                  </li>
                );
              })}
            </ul>
          )}
          {errors.password && !form.password && (
            <p className={styles.error}>{errors.password}</p>
          )}
        </div>

        <div className={styles.campo}>
          <label htmlFor="confirmar">Confirmá la contraseña</label>
          <input
            id="confirmar"
            name="confirmar"
            type="password"
            value={form.confirmar}
            onChange={actualizar}
            placeholder="Repetí la contraseña"
            autoComplete="new-password"
          />
          {errors.confirmar && <p className={styles.error}>{errors.confirmar}</p>}
        </div>

        <button type="submit" className={styles.botonSubmit} disabled={cargando}>
          {cargando ? 'Guardando...' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  );
}

// ── Página raíz — elige la vista según si hay token en la URL ─────────────────

function ContenidoPagina() {
  const searchParams = useSearchParams();
  const tieneToken = Boolean(searchParams.get('token'));
  return tieneToken ? <FormNuevaPassword /> : <FormSolicitud />;
}

export default function RecuperarContrasenaPage() {
  return (
    <Suspense>
      <ContenidoPagina />
    </Suspense>
  );
}
