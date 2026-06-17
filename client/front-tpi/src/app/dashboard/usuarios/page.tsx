'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import type { UsuarioDashboard } from '@/lib/dashboard-types';
import TablaEntidad, { type ColumnaTabla } from '@/component/dashboard/TablaEntidad';
import ConfirmDialog from '@/component/cart/ConfirmDialog';

const COLUMNAS: ColumnaTabla<UsuarioDashboard>[] = [
  { encabezado: 'Nombre',  render: (u) => `${u.nombre} ${u.apellido}` },
  { encabezado: 'Email',   render: (u) => u.email },
  { encabezado: 'Roles',   render: (u) => u.roles.map((r) => r.nombre).join(', ') || '—' },
  {
    encabezado: 'Estado',
    render: (u) => (
      <span style={{ color: u.activo ? '#2e7d32' : '#c0392b', fontWeight: 600 }}>
        {u.activo ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
];

export default function UsuariosPage() {
  const [datos, setDatos] = useState<UsuarioDashboard[]>([]);
  const [cargando, setCargando] = useState(true);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await apiFetch<UsuarioDashboard[]>('/api/users');
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
      await apiFetch(`/api/dashboard/users/${idAEliminar}`, { method: 'DELETE' });
      setIdAEliminar(null);
      cargar();
    } catch {
      setIdAEliminar(null);
    }
  };

  return (
    <>
      <TablaEntidad
        titulo="Usuarios"
        rutaNuevo="/dashboard/usuarios/nuevo"
        labelNuevo="Nuevo usuario"
        columnas={COLUMNAS}
        datos={datos}
        cargando={cargando}
        pagina={1}
        totalPaginas={1}
        onCambiarPagina={() => {}}
        acciones={{
          rutaEditar: (id) => `/dashboard/usuarios/${id}/editar`,
          urlVer: () => '/perfil',
          onEliminar: setIdAEliminar,
        }}
      />

      <ConfirmDialog
        abierto={!!idAEliminar}
        titulo="Dar de baja usuario"
        mensaje="¿Estás seguro de que querés dar de baja este usuario? El usuario quedará inactivo y no podrá iniciar sesión."
        textoConfirmar="Dar de baja"
        destructivo
        onConfirmar={handleEliminar}
        onCancelar={() => setIdAEliminar(null)}
      />
    </>
  );
}
