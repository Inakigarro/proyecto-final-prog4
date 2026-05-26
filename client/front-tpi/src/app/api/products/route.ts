import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("query");
    const backendUrl = new URL("http://localhost:4001/api/products");

    if (query) {
      backendUrl.searchParams.set("query", query);
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
