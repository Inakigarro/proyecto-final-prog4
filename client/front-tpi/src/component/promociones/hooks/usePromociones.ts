"use client";

import { useEffect, useState } from "react";
import type { Promocion } from "@/lib/promociones";

interface EstadoPromociones {
  promociones: Promocion[];
  cargando: boolean;
}

/**
 * Hook client-side que trae las promociones activas vía el proxy `/api/promotions`.
 * Pensado para Client Components (search-result, detalle de producto).
 * Para Server Components usar `obtenerPromociones()` de `lib/promociones`.
 */
export const usePromociones = (): EstadoPromociones => {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPromociones = async () => {
      try {
        const respuesta = await fetch("/api/promotions");
        if (!respuesta.ok) return;
        const datos = await respuesta.json();
        setPromociones((datos?.promociones as Promocion[]) ?? []);
      } catch {
        // Falla silenciosa: el sitio sigue funcionando sin cucardas
      } finally {
        setCargando(false);
      }
    };
    cargarPromociones();
  }, []);

  return { promociones, cargando };
};
