'use client';

/**
 * AuthContext — adapter sobre Redux Toolkit.
 *
 * Mantiene la API pública (AuthProvider y useAuth) idéntica a la versión
 * original basada en useReducer + Context, pero por dentro lee/escribe
 * contra el store de Redux.
 *
 * AuthProvider es el límite del <ReduxProvider> (es el wrapper más externo
 * en el layout), por eso lo monta aquí junto al AuthHidratator.
 * CartProvider y cualquier otro proveedor que viva adentro heredan el store.
 */

import { useCallback, useEffect, type ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store, type AppDispatch } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  hidratado as hidratadoAction,
  cargaCompleta as cargaCompletaAction,
  logout as logoutAction,
} from '@/store/authSlice';
import { setAccessToken } from '@/lib/api';

// Re-exportar tipos del slice para que los consumidores no cambien sus imports.
export type { AccionPermiso, Permiso, Rol, UsuarioPerfil, AuthState } from '@/store/authSlice';
import type { AccionPermiso, AuthState, UsuarioPerfil } from '@/store/authSlice';

// ── Constantes ────────────────────────────────────────────────────────────────

const REFRESH_TOKEN_KEY = 'techpoint:refresh_token';
/** Refresca el access token 1 minuto antes de que expire (token dura 15 min) */
const INTERVALO_REFRESH_MS = 14 * 60 * 1000;

/** Timer de renovación automática (singleton — una sola sesión activa). */
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

// ── Helpers de red (fuera del componente para no recrearse) ───────────────────

async function fetchPerfil(accessToken: string): Promise<UsuarioPerfil> {
  const res = await fetch('/api/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('No se pudo obtener el perfil del usuario');
  return res.json() as Promise<UsuarioPerfil>;
}

/**
 * Intenta renovar la sesión usando el refresh token guardado en localStorage.
 * Si tiene éxito, actualiza el access token en memoria y despacha el perfil.
 * Si falla (token vencido/inválido), cierra la sesión.
 * Al finalizar con éxito, programa el próximo refresh automático.
 */
async function intentarRefresh(dispatch: AppDispatch): Promise<void> {
  const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!storedRefresh) {
    setAccessToken(null);
    dispatch(logoutAction());
    return;
  }

  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefresh }),
    });

    if (!res.ok) throw new Error('Refresh token inválido o expirado');

    const { accessToken, refreshToken: nuevoRefresh } = await res.json() as {
      accessToken: string;
      refreshToken: string;
    };

    localStorage.setItem(REFRESH_TOKEN_KEY, nuevoRefresh);
    setAccessToken(accessToken);

    const usuario = await fetchPerfil(accessToken);
    dispatch(hidratadoAction(usuario));

    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => intentarRefresh(dispatch), INTERVALO_REFRESH_MS);
  } catch {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    if (refreshTimer) clearTimeout(refreshTimer);
    dispatch(logoutAction());
  }
}

// ── Hidratador ────────────────────────────────────────────────────────────────

/**
 * Verifica si hay un refresh token guardado y restaura la sesión al montar.
 * Vive dentro del <ReduxProvider> para poder usar useAppDispatch.
 */
function AuthHidratator() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!storedRefresh) {
      dispatch(cargaCompletaAction());
      return;
    }

    intentarRefresh(dispatch);

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [dispatch]);

  return null;
}

// ── Proveedor ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <AuthHidratator />
      {children}
    </ReduxProvider>
  );
}

// ── Tipos de contexto públicos ────────────────────────────────────────────────

export interface RegistrarInput {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  /** Fecha en formato dd/MM/YYYY */
  fechaNacimiento: string;
}

export interface AuthContextValue {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  registrar: (datos: RegistrarInput) => Promise<void>;
  logout: () => Promise<void>;
  solicitarReset: (email: string) => Promise<void>;
  resetearPassword: (token: string, nuevaPassword: string) => Promise<void>;
  tienePermiso: (recurso: string, accion: AccionPermiso) => boolean;
  tieneRol: (nombre: string) => boolean;
  esSuperAdmin: () => boolean;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.auth);

  /**
   * Inicia sesión con email y contraseña.
   * Lanza un Error con el mensaje del backend si las credenciales son inválidas.
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(data.message ?? 'Error al iniciar sesión');
      }

      const { accessToken, refreshToken } = await res.json() as {
        accessToken: string;
        refreshToken: string;
      };

      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      setAccessToken(accessToken);

      const usuario = await fetchPerfil(accessToken);
      dispatch(hidratadoAction(usuario));

      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => intentarRefresh(dispatch), INTERVALO_REFRESH_MS);
    },
    [dispatch]
  );

  /**
   * Crea una nueva cuenta de usuario. No inicia sesión automáticamente;
   * llama a login() después si querés autenticar al usuario de inmediato.
   * Lanza un Error con el mensaje del backend si el registro falla.
   */
  const registrar = useCallback(async (datos: RegistrarInput): Promise<void> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(data.message ?? 'Error al registrar el usuario');
    }
  }, []);

  /**
   * Cierra la sesión. Intenta revocar el refresh token en el backend (best effort)
   * y siempre limpia el estado local.
   */
  const logout = useCallback(async (): Promise<void> => {
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (storedRefresh) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: storedRefresh }),
        });
      } catch {
        // Ignorar errores de red — siempre cerramos la sesión localmente
      }
    }

    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    if (refreshTimer) clearTimeout(refreshTimer);
    dispatch(logoutAction());
  }, [dispatch]);

  /** Solicita el envío del email de recuperación de contraseña. */
  const solicitarReset = useCallback(async (email: string): Promise<void> => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(data.message ?? 'Error al solicitar el restablecimiento de contraseña');
    }
  }, []);

  /** Restablece la contraseña usando el token recibido por email. */
  const resetearPassword = useCallback(
    async (token: string, nuevaPassword: string): Promise<void> => {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, nuevaPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(data.message ?? 'Error al restablecer la contraseña');
      }
    },
    []
  );

  /** Verifica si el usuario tiene un permiso específico sobre un recurso */
  const tienePermiso = useCallback(
    (recurso: string, accion: AccionPermiso): boolean => {
      if (!state.usuario) return false;
      return state.usuario.roles
        .flatMap((r) => r.permisos)
        .some((p) => p.recurso === recurso && p.accion === accion);
    },
    [state.usuario]
  );

  /** Verifica si el usuario tiene un rol por nombre */
  const tieneRol = useCallback(
    (nombre: string): boolean => {
      return state.usuario?.roles.some((r) => r.nombre === nombre) ?? false;
    },
    [state.usuario]
  );

  /** Verifica si el usuario tiene el rol superadmin */
  const esSuperAdmin = useCallback(
    (): boolean => tieneRol('superadmin'),
    [tieneRol]
  );

  return { state, login, registrar, logout, solicitarReset, resetearPassword, tienePermiso, tieneRol, esSuperAdmin };
}
