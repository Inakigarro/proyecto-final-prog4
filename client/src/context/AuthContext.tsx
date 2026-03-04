import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api, { setAccessToken, clearSesion } from '@/api/axios';
import type { Usuario, AuthResponse, LoginForm, RegisterForm } from '@/types';

// ─── Tipos del contexto ───────────────────────────────────────────────────────

interface AuthContextType {
  usuario: Usuario | null;
  cargando: boolean;
  login: (datos: LoginForm) => Promise<void>;
  register: (datos: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Contexto ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  // Mientras se verifica la sesión guardada, muestra loading
  const [cargando, setCargando] = useState(true);

  // Al montar la app, intenta renovar la sesión usando el refresh token guardado
  useEffect(() => {
    const restaurarSesion = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        setCargando(false);
        return;
      }

      try {
        const { data } = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
        setAccessToken(data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // Obtener datos del usuario con el nuevo access token
        const { data: perfil } = await api.get<Usuario>('/users/me');
        setUsuario(perfil);
      } catch {
        // El refresh token expiró o es inválido
        clearSesion();
      } finally {
        setCargando(false);
      }
    };

    restaurarSesion();
  }, []);

  /** Inicia sesión y guarda los tokens */
  const login = async (datos: LoginForm): Promise<void> => {
    const { data } = await api.post<AuthResponse>('/auth/login', datos);
    setAccessToken(data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    const { data: perfil } = await api.get<Usuario>('/users/me');
    setUsuario(perfil);
  };

  /** Registra un nuevo usuario (sin iniciar sesión automáticamente) */
  const register = async (datos: RegisterForm): Promise<void> => {
    await api.post('/auth/register', datos);
  };

  /** Cierra sesión: revoca el refresh token en el servidor y limpia el estado */
  const logout = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/auth/logout', { refreshToken });
    } finally {
      clearSesion();
      setUsuario(null);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/** Hook para acceder al contexto de autenticación desde cualquier componente */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
