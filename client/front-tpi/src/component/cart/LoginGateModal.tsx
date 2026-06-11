'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import './LoginGateModal.css';

interface LoginGateModalProps {
  abierto: boolean;
  onCerrar: () => void;
  /** Callback opcional que se ejecuta después de un login exitoso */
  onLoginExitoso?: () => void;
}

const LoginGateModal = ({ abierto, onCerrar, onLoginExitoso }: LoginGateModalProps) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  // Cerrar con Escape + bloquear scroll del body mientras está abierto
  useEffect(() => {
    if (!abierto) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', onKeyDown);

    const scrollPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = scrollPrevio;
    };
  }, [abierto, onCerrar]);

  // Limpiar el formulario cada vez que se cierra
  useEffect(() => {
    if (!abierto) {
      setEmail('');
      setPassword('');
      setError(null);
    }
  }, [abierto]);

  if (!abierto) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      await login(email.trim(), password);
      onLoginExitoso?.();
      onCerrar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <div
        className="login-gate-overlay"
        onClick={onCerrar}
        aria-hidden="true"
      />

      <div
        className="login-gate-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-gate-title"
      >
        <header className="login-gate-header">
          <h2 id="login-gate-title" className="login-gate-titulo">
            Iniciar sesión
          </h2>
          <button
            type="button"
            className="login-gate-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>

        <form className="login-gate-body" onSubmit={handleSubmit} noValidate>
          <label className="login-gate-label">
            <span>Email</span>
            <input
              type="email"
              className="login-gate-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
              disabled={cargando}
            />
          </label>

          <label className="login-gate-label">
            <span>Contraseña</span>
            <input
              type="password"
              className="login-gate-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={cargando}
            />
          </label>

          {error && (
            <div className="login-gate-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-gate-cta"
            disabled={cargando || !email || !password}
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="login-gate-olvidaste">
            <a href="/recuperar-contrasena" onClick={onCerrar}>
              ¿Olvidaste tu contraseña?
            </a>
          </p>
        </form>
      </div>
    </>
  );
};

export default LoginGateModal;
