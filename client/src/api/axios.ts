import axios from 'axios';
import type { AuthResponse } from '@/types';

/**
 * Instancia principal de Axios.
 * Todos los requests al servidor se hacen a través de esta instancia.
 * El proxy de Vite redirige /api → http://localhost:3000/api en desarrollo.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Interceptor de request ───────────────────────────────────────────────────
// Adjunta el access token a cada request si existe en memoria
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Interceptor de response ──────────────────────────────────────────────────
// Si el servidor responde 401, intenta renovar el access token con el refresh token
// y reintenta el request original una sola vez.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestOriginal = error.config;

    if (error.response?.status === 401 && !requestOriginal._reintentado) {
      requestOriginal._reintentado = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return Promise.reject(error);

      try {
        const { data } = await axios.post<AuthResponse>('/api/auth/refresh', { refreshToken });
        setAccessToken(data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // Reintentar el request original con el nuevo token
        requestOriginal.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(requestOriginal);
      } catch {
        // El refresh falló: limpiar sesión
        clearSesion();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// ─── Gestión del access token en memoria ─────────────────────────────────────
// El access token NO se guarda en localStorage para evitar ataques XSS.
// El refresh token sí se guarda en localStorage para persistir la sesión.

let _accessToken: string | null = null;

export const getAccessToken = (): string | null => _accessToken;
export const setAccessToken = (token: string): void => { _accessToken = token; };

export const clearSesion = (): void => {
  _accessToken = null;
  localStorage.removeItem('refreshToken');
};

export default api;
