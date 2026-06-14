import { NextResponse } from 'next/server';

export const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:4000';

function encabezados(request: Request): HeadersInit {
  const auth = request.headers.get('Authorization');
  return {
    'Content-Type': 'application/json',
    ...(auth ? { Authorization: auth } : {}),
  };
}

export async function proxyA(
  url: string,
  method: string,
  request: Request,
): Promise<NextResponse> {
  try {
    let body: string | undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try { body = JSON.stringify(await request.json()); } catch { /* sin body */ }
    }

    const res = await fetch(url, { method, headers: encabezados(request), body });

    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ message: 'No se pudo conectar al backend', detalle }, { status: 502 });
  }
}
