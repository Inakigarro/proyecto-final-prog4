'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import type { ProductoDashboard, ProductosPageResponse } from '@/lib/dashboard-types';
import TablaEntidad, { type ColumnaTabla } from '@/component/dashboard/TablaEntidad';
import ConfirmDialog from '@/component/cart/ConfirmDialog';

const COLUMNAS: ColumnaTabla<ProductoDashboard>[] = [
  { encabezado: 'Nombre',      render: (p) => p.nombre },
  { encabezado: 'Precio',      render: (p) => `$${p.precioUnitario.toFixed(2)}` },
  { encabezado: 'Stock',       render: (p) => p.stock },
  { encabezado: 'Categorías',  render: (p) => p.category.map((c) => c.nombre).join(', ') || '—' },
];

export default function ProductosPage() {
  const [datos, setDatos] = useState<ProductoDashboard[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);

  const cargar = useCallback(async (pag: number) => {
    setCargando(true);
    try {
      const res = await apiFetch<ProductosPageResponse>(
        `/api/dashboard/products?pagina=${pag}&limite=10`
      );
      setDatos(res.datos);
      setTotalPaginas(res.totalPaginas);
    } catch {
      setDatos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(pagina); }, [pagina, cargar]);

  const handleEliminar = async () => {
    if (!idAEliminar) return;
    try {
      await apiFetch(`/api/products/${idAEliminar}`, { method: 'DELETE' });
      setIdAEliminar(null);
      cargar(pagina);
    } catch {
      setIdAEliminar(null);
    }
  };

  return (
    <>
      <TablaEntidad
        titulo="Productos"
        rutaNuevo="/dashboard/productos/nuevo"
        labelNuevo="Nuevo producto"
        columnas={COLUMNAS}
        datos={datos}
        cargando={cargando}
        pagina={pagina}
        totalPaginas={totalPaginas}
        onCambiarPagina={setPagina}
        acciones={{
          rutaEditar: (id) => `/dashboard/productos/${id}/editar`,
          urlVer: (item) => `/product-detail-page/${(item as ProductoDashboard).id}`,
          onEliminar: setIdAEliminar,
        }}
      />

      <ConfirmDialog
        abierto={!!idAEliminar}
        titulo="Eliminar producto"
        mensaje="¿Estás seguro de que querés eliminar este producto? Esta acción no se puede deshacer."
        textoConfirmar="Eliminar"
        destructivo
        onConfirmar={handleEliminar}
        onCancelar={() => setIdAEliminar(null)}
      />
    </>
  );
}
