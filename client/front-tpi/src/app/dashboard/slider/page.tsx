'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import type { SlideDashboard } from '@/lib/dashboard-types';
import TablaEntidad, { type ColumnaTabla } from '@/component/dashboard/TablaEntidad';
import ConfirmDialog from '@/component/cart/ConfirmDialog';

/**
 * Columnas de la tabla del dashboard de slides.
 * La preview de imagen se renderiza chica para que la tabla mantenga compactness;
 * en la edición se puede ver el archivo en grande con el preview del formulario.
 */
const COLUMNAS: ColumnaTabla<SlideDashboard>[] = [
  {
    encabezado: 'Imagen',
    render: (s) => (
      <img
        src={s.imagen}
        alt={s.alt}
        style={{
          width: 80,
          height: 45,
          objectFit: 'cover',
          borderRadius: 4,
          border: '1px solid var(--color-border, #ddd)',
        }}
      />
    ),
  },
  { encabezado: 'Leyenda', render: (s) => s.leyenda },
  { encabezado: 'Alt',     render: (s) => s.alt },
  { encabezado: 'Orden',   render: (s) => s.orden },
];

/**
 * Página `/dashboard/slider` — listado de slides del home con CRUD.
 *
 * Acceso restringido a roles `dueno` y `superadmin` por el layout del dashboard.
 * El listado no se pagina por ahora: el home tiene típicamente pocos slides
 * (3-10), no justifica paginación.
 */
export default function SliderPage() {
  const [datos, setDatos] = useState<SlideDashboard[]>([]);
  const [cargando, setCargando] = useState(true);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await apiFetch<SlideDashboard[]>('/api/dashboard/slides');
      setDatos(res);
    } catch {
      setDatos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const handleEliminar = async () => {
    if (!idAEliminar) return;
    try {
      await apiFetch(`/api/dashboard/slides/${idAEliminar}`, { method: 'DELETE' });
      setIdAEliminar(null);
      await cargar();
    } catch {
      setIdAEliminar(null);
    }
  };

  return (
    <>
      <TablaEntidad
        titulo="Slider del home"
        rutaNuevo="/dashboard/slider/nuevo"
        labelNuevo="Nuevo slide"
        columnas={COLUMNAS}
        datos={datos}
        cargando={cargando}
        pagina={1}
        totalPaginas={1}
        onCambiarPagina={() => undefined}
        acciones={{
          rutaEditar: (id) => `/dashboard/slider/${id}/editar`,
          urlVer: () => '/',
          onEliminar: setIdAEliminar,
        }}
      />

      <ConfirmDialog
        abierto={!!idAEliminar}
        titulo="Eliminar slide"
        mensaje="¿Estás seguro de que querés eliminar este slide del home? Esta acción no se puede deshacer."
        textoConfirmar="Eliminar"
        destructivo
        onConfirmar={handleEliminar}
        onCancelar={() => setIdAEliminar(null)}
      />
    </>
  );
}
