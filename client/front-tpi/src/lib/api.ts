/**
 * Error normalizado que devuelve apiFetch cuando el backend responde
 * con un status fuera de 2xx, o cuando hay un problema de red.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

// Access token almacenado en memoria (no en localStorage para evitar XSS).
// AuthContext llama a setAccessToken después de login/refresh.
let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

function obtenerToken(): string | null {
  return _accessToken;
}

/**
 * Llama a un endpoint del backend usando el rewrite de Next configurado
 * en next.config.ts. La ruta debe empezar con "/api/...".
 *
 * @param path  Ruta relativa al backend (ej. "/api/cart/validate").
 * @param init  Opciones estándar de fetch. El header Content-Type se setea
 *              automáticamente cuando el body es un objeto plano.
 * @returns     El JSON parseado de la respuesta tipado como T.
 * @throws      ApiError si la respuesta no es 2xx o si hubo un problema de red.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {

  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  const token = obtenerToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(path, { ...init, headers });
  } catch (networkError) {
    const detalle =
      networkError instanceof Error ? networkError.message : 'desconocido';
    throw new ApiError(`Error de red: ${detalle}`, 0, null);
  }

  // Intentamos parsear el body siempre, sea ok o error, para tener detalle.
  const cuerpo = await leerCuerpo(response);

  if (!response.ok) {
    const mensaje = extraerMensajeDeError(cuerpo, response.status);
    throw new ApiError(mensaje, response.status, cuerpo);
  }

  return cuerpo as T;
}

/**
 Leo body de la respuesta que me da el json
 */
async function leerCuerpo(response: Response): Promise<unknown> {
  const texto = await response.text();
  if (!texto) return null;

  const contentType = response.headers.get('Content-Type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(texto);
    } catch {
      return texto;
    }
  }
  return texto;
}

function extraerMensajeDeError(cuerpo: unknown, status: number): string {
  if (cuerpo && typeof cuerpo === 'object' && 'message' in cuerpo) {
    const msg = (cuerpo as { message: unknown }).message;
    if (typeof msg === 'string') return msg;
  }
  return `Error HTTP ${status}`;
}