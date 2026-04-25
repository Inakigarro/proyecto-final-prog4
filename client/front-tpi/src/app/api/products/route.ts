import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://localhost:4000/api/products", {
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

    const data = await res.text();

    return NextResponse.json({
      success: true,
      message: "Los productos se han obtenido correctamente",
      backendResponse: data,
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
