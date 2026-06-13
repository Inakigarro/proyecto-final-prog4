import { NextResponse } from "next/server";

const URL_BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";

/**
 * Proxy GET hacia el endpoint de promociones del backend.
 * Existe para que los Client Components puedan consumir promociones sin CORS.
 */
export async function GET() {
  try {
    const respuesta = await fetch(`${URL_BACKEND}/api/promotions`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!respuesta.ok) {
      return NextResponse.json(
        { success: false, error: `Backend respondió con código ${respuesta.status}` },
        { status: respuesta.status },
      );
    }

    const promociones = await respuesta.json();
    return NextResponse.json({ success: true, promociones });
  } catch (error) {
    const detalle = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { success: false, error: "No se puede conectar al backend", detalle },
      { status: 500 },
    );
  }
}
