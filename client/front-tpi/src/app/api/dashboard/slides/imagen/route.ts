import { NextResponse } from 'next/server';
import { BACKEND_URL } from '../../_helpers';

/**
 * Proxy POST para el upload de imagen del slide.
 *
 * No usa el helper `proxyA` porque ese helper parsea JSON. Acá necesitamos
 * pasar el FormData crudo al backend sin tocarlo (multer del backend tiene
 * que recibir el multipart intacto). También reenviamos el Content-Type del
 * cliente que incluye el boundary del multipart.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const auth = request.headers.get('Authorization');
    const contentType = request.headers.get('Content-Type');
    const headers: Record<string, string> = {};
    if (auth) headers.Authorization = auth;
    if (contentType) headers['Content-Type'] = contentType;

    // Reusamos el body como stream para no cargar el archivo en memoria del proxy.
    const res = await fetch(`${BACKEND_URL}/api/slides/imagen`, {
      method: 'POST',
      headers,
      body: request.body,
      // @ts-expect-error — `duplex` es obligatorio cuando se reenvía un body stream
      // en Node fetch; el tipo aún no lo refleja.
      duplex: 'half',
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { message: 'No se pudo conectar al backend', detalle },
      { status: 502 },
    );
  }
}
