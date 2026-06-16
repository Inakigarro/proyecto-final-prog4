/**
 * Cliente server-side del endpoint de slides del backend.
 * Pensado para Server Components — no usar en client components.
 */

export interface Slide {
  id: string;
  imagen: string;
  alt: string;
  leyenda: string;
  orden: number;
}

const URL_BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000';

/**
 * Obtiene los slides activos del home, ordenados ascendentemente por `orden`.
 * Ante cualquier falla devuelve un array vacío para que la home renderice sin romper.
 */
export const obtenerSlides = async (): Promise<Slide[]> => {
  try {
    const respuesta = await fetch(`${URL_BACKEND}/api/slides`, {
      headers: { 'Content-Type': 'application/json' },
      // No cachear para que el dueño vea cambios al refrescar tras editar.
      cache: 'no-store',
    });
    if (!respuesta.ok) return [];
    return (await respuesta.json()) as Slide[];
  } catch {
    return [];
  }
};
