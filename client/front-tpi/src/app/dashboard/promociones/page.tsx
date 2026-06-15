'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import type { PromocionDashboard } from '@/lib/dashboard-types';
import TablaEntidad, { type ColumnaTabla } from '@/component/dashboard/TablaEntidad';
import ConfirmDialog from '@/component/cart/ConfirmDialog';

const ETIQUETA_TIPO: Record<string, string> = {
  DESCUENTO_PORCENTUAL: 'Descuento %',
  NXM:                 'N×M',
  SEGUNDA_UNIDAD:      '2ª unidad',
};

const COLUMNAS: ColumnaTabla<PromocionDashboard>[] = [
  { encabezado: 'Nombre',    render: (p) => p.nombrePromocion },
  { encabezado: 'Tipo',      render: (p) => ETIQUETA_TIPO[p.tipoPromocion] ?? p.tipoPromocion },
  { encabezado: 'Productos', render: (p) => p.idsProductos.length },
];

export default function PromocionesPage() {
  const [datos, setDatos] = useState<PromocionDashboard[]>([]);
  const [cargando, setCargando] = useState(true);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await apiFetch<PromocionDashboard[]>('/api/dashboard/promotions');
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
      await apiFetch(`/api/promotions/${idAEliminar}`, { method: 'DELETE' });
      setIdAEliminar(null);
      cargar();
    } catch {
      setIdAEliminar(null);
    }
  };

  return (
    <>
      <TablaEntidad
        titulo="Promociones"
        rutaNuevo="/dashboard/promociones/nueva"
        labelNuevo="Nueva promoción"
        columnas={COLUMNAS}
        datos={datos.map((p) => ({ ...p, id: p.idPromocion }))}
        cargando={cargando}
        pagina={1}
        totalPaginas={1}
        onCambiarPagina={() => {}}
        acciones={{
          rutaEditar: (id) => `/dashboard/promociones/${id}/editar`,
          urlVer: (item) => `/promociones/${(item as PromocionDashboard & { id: string }).id}`,
          onEliminar: setIdAEliminar,
        }}
      />

      <ConfirmDialog
        abierto={!!idAEliminar}
        titulo="Eliminar promoción"
        mensaje="¿Estás seguro de que querés eliminar esta promoción?"
        textoConfirmar="Eliminar"
        destructivo
        onConfirmar={handleEliminar}
        onCancelar={() => setIdAEliminar(null)}
      />
    </>
  );
}
