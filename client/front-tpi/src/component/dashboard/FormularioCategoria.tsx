'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import type { CategoriaDashboard } from '@/lib/dashboard-types';
import styles from './FormularioProducto.module.css'; // Reutiliza los mismos estilos

interface Props {
  id?: string;
}

export default function FormularioCategoria({ id }: Props) {
  const router = useRouter();
  const esEdicion = !!id;

  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(esEdicion);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!esEdicion) return;
    apiFetch<CategoriaDashboard>(`/api/categories/${id}`)
      .then((c) => setNombre(c.nombre))
      .catch(() => setError('No se pudo cargar la categoría.'))
      .finally(() => setCargando(false));
  }, [id, esEdicion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    setEnviando(true);
    try {
      const body = { nombre: nombre.trim() };
      if (esEdicion) {
        await apiFetch(`/api/categories/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch('/api/categories', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      router.push('/dashboard/categorias');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la categoría.';
      setError(msg);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <p className={styles.estado}>Cargando...</p>;

  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>{esEdicion ? 'Editar categoría' : 'Nueva categoría'}</h1>

      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.campo}>
          <label htmlFor="nombre">Nombre *</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Periféricos"
            required
            minLength={3}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.botones}>
          <button
            type="button"
            onClick={() => router.push('/dashboard/categorias')}
            className={styles.botonCancelar}
          >
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className={styles.botonGuardar}>
            {enviando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </div>
      </form>
    </div>
  );
}
