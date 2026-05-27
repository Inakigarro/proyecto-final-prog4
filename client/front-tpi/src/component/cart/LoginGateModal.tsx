'use client';

/**
 * LoginGateModal — placeholder visual del login.
 *
 * NO valida nada. Solo deja claro al dev que tome el ticket de auth dónde
 * tiene que ir el login real. El form es decorativo (email/password no se
 * leen) y el botón "Continuar" navega directo a /carrito.
 *
 * Cuando se implemente auth real, este componente debería ser reemplazado
 * por el modal de login posta, conectado al AuthContext correspondiente.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './LoginGateModal.css';

interface LoginGateModalProps {
  abierto: boolean;
  onCerrar: () => void;
}

const LoginGateModal = ({ abierto, onCerrar }: LoginGateModalProps) => {
  const router = useRouter();

  // Estado local del form. No se valida ni se envía a ningún lado.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Cerrar con Escape + bloquear scroll del body mientras está abierto.
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

  // Limpiar el form cada vez que se cierra.
  useEffect(() => {
    if (!abierto) {
      setEmail('');
      setPassword('');
    }
  }, [abierto]);

  if (!abierto) return null;

  const handleContinuar = () => {
    onCerrar();
    router.push('/carrito');
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

        <div className="login-gate-body">
          <label className="login-gate-label">
            <span>Email</span>
            <input
              type="email"
              className="login-gate-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="off"
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
              autoComplete="off"
            />
          </label>

          <button
            type="button"
            className="login-gate-cta"
            onClick={handleContinuar}
          >
            Continuar
          </button>
        </div>

        <div className="login-gate-aviso">
          <strong>⚠ PLACEHOLDER</strong>
          <p>
            Este modal es solo un marcador visual. No valida credenciales.
            Acá va el login real cuando se implemente el módulo de
            autenticación.
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginGateModal;