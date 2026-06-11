import { NextResponse } from "next/server";

const URL_BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    // El backend espera el filtro de texto como "q" (no "query").
    const query = url.searchParams.get("query");
    const backendUrl = new URL(`${URL_BACKEND}/api/products`);

    if (query) {
      backendUrl.searchParams.set("q", query);
    }

    const res = await fetch(backendUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Backend respondió con código ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      message: "Los productos se han obtenido correctamente",
      products: data,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      {
        success: false,
        error: "No se puede conectar al backend",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
