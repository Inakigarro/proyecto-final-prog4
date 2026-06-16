'use client';

import { useCallback, useState } from 'react';
import { apiFetch, ApiError, setAccessToken } from '@/lib/api';

/**
 * Misma key que usa AuthContext para guardar el refresh token. Se duplica acá
 * a propósito: si en algún momento cambia, hay que cambiarla en los dos lados.
 */
const REFRESH_TOKEN_KEY = 'techpoint:refresh_token';

/**
 * Validador de complejidad de contraseña — espejo del backend
 * (server/src/models/User.ts:validarComplejidadPassword).
 *
 * Sirve para feedback inmediato en el formulario; el backend igual valida.
 */
export const validarComplejidadPassword = (password: string): boolean => (
  password.length >= 8
  && /[A-Z]/.test(password)
  && /[a-z]/.test(password)
  && /[0-9]/.test(password)
  && /[^A-Za-z0-9]/.test(password)
);

/** Pasos del flujo de cambio: form inicial → código por mail → confirmado. */
export type PasoCambio = 'inicial' | 'codigo' | 'confirmado';

/** Respuesta del confirm con los nuevos tokens emitidos. */
interface RespuestaConfirm {
  accessToken: string;
  refreshToken: string;
}

/**
 * Estado expuesto por el hook useCambioPassword.
 */
export interface EstadoCambioPassword {
  paso: PasoCambio;
  procesando: boolean;
  error: string | null;
  /**
   * Solicita el código de verificación al backend.
   * Si la actual es válida, avanza al paso 'codigo'.
   */
  solicitar: (passwordActual: string, nuevaPassword: string) => Promise<void>;
  /**
   * Confirma el cambio con el código recibido por email.
   * Si es correcto, actualiza tokens en cliente y avanza al paso 'confirmado'.
   */
  confirmar: (codigo: string) => Promise<void>;
  /** Vuelve al paso inicial limpiando el código pendiente del cliente. */
  reiniciar: () => void;
}

/**
 * Hook que orquesta el cambio de contraseña en dos pasos (request + confirm).
 *
 * Tras un confirm exitoso reemplaza los tokens locales con los que devuelve
 * el backend, así la sesión actual sigue válida aunque el backend haya
 * revocado todos los refresh tokens previos.
 */
export function useCambioPassword(): EstadoCambioPassword {
  const [paso, setPaso] = useState<PasoCambio>('inicial');
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const solicitar = useCallback(async (passwordActual: string, nuevaPassword: string) => {
    setProcesando(true);
    setError(null);
    try {
      await apiFetch<null>('/api/auth/password/change/request', {
        method: 'POST',
        body: JSON.stringify({ passwordActual, nuevaPassword }),
      });
      setPaso('codigo');
    } catch (err) {
      const mensaje = err instanceof ApiError ? err.message : 'No se pudo iniciar el cambio de contraseña.';
      setError(mensaje);
      throw err;
    } finally {
      setProcesando(false);
    }
  }, []);

  const confirmar = useCallback(async (codigo: string) => {
    setProcesando(true);
    setError(null);
    try {
      const respuesta = await apiFetch<RespuestaConfirm>('/api/auth/password/change/confirm', {
        method: 'POST',
        body: JSON.stringify({ codigo }),
      });

      // Reemplazamos los tokens locales por los nuevos para no perder la sesión
      localStorage.setItem(REFRESH_TOKEN_KEY, respuesta.refreshToken);
      setAccessToken(respuesta.accessToken);
      setPaso('confirmado');
    } catch (err) {
      const mensaje = err instanceof ApiError ? err.message : 'No se pudo confirmar el cambio.';
      setError(mensaje);
      throw err;
    } finally {
      setProcesando(false);
    }
  }, []);

  const reiniciar = useCallback(() => {
    setPaso('inicial');
    setError(null);
  }, []);

  return { paso, procesando, error, solicitar, confirmar, reiniciar };
}
