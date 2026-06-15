'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import type { CategoriaDashboard } from '@/lib/dashboard-types';
import TablaEntidad, { type ColumnaTabla } from '@/component/dashboard/TablaEntidad';
import ConfirmDialog from '@/component/cart/ConfirmDialog';

const COLUMNAS: ColumnaTabla<CategoriaDashboard>[] = [
  { encabezado: 'Nombre',         render: (c) => c.nombre },
  { encabezado: 'Cant. productos', render: (c) => c.cantidadItems },
];

export default function CategoriasPage() {
  const [datos, setDatos] = useState<CategoriaDashboard[]>([]);
  const [cargando, setCargando] = useState(true);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await apiFetch<CategoriaDashboard[]>('/api/categories');
      setDatos(res);
    } catch {
      setDatos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleEliminar = async () => {
    if (!idAEliminar) return;
    try {
      await apiFetch(`/api/categories/${idAEliminar}`, { method: 'DELETE' });
      setIdAEliminar(null);
      cargar();
    } catch {
      setIdAEliminar(null);
    }
  };

  return (
    <>
      <TablaEntidad
        titulo="Categorías"
        rutaNuevo="/dashboard/categorias/nueva"
        labelNuevo="Nueva categoría"
        columnas={COLUMNAS}
        datos={datos}
        cargando={cargando}
        pagina={1}
        totalPaginas={1}
        onCambiarPagina={() => {}}
        acciones={{
          rutaEditar: (id) => `/dashboard/categorias/${id}/editar`,
          urlVer: (item) => `/search-result?categoria=${encodeURIComponent((item as CategoriaDashboard).nombre)}`,
          onEliminar: setIdAEliminar,
        }}
      />

      <ConfirmDialog
        abierto={!!idAEliminar}
        titulo="Eliminar categoría"
        mensaje="¿Estás seguro de que querés eliminar esta categoría? Se desvinculará de todos los productos que la tengan asignada."
        textoConfirmar="Eliminar"
        destructivo
        onConfirmar={handleEliminar}
        onCancelar={() => setIdAEliminar(null)}
      />
    </>
  );
}
