import { NextResponse } from 'next/server';

/**
 * Endpoint de prueba para verificar la conexión con el backend.
 * GET /api/test-connection
 */
export async function GET() {
  try {
    // IMPORTANTE: Cuando este código corre en un API Route (Node.js), el rewrite de Next.js NO aplica.
    // Por eso, hay que usar la URL completa del backend:
    const res = await fetch('http://localhost:4000/api', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Backend respondió con código ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.text();

    return NextResponse.json({
      success: true,
      message: 'Conexión con el backend exitosa',
      backendResponse: data,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { 
        success: false, 
        error: 'No se puede conectar al backend',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

