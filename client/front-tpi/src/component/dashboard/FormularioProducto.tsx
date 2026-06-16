'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import type { ProductoDashboard, CategoriaDashboard } from '@/lib/dashboard-types';
import styles from './FormularioProducto.module.css';

interface Props {
  id?: string; // Si se pasa, modo edición
}

export default function FormularioProducto({ id }: Props) {
  const router = useRouter();
  const esEdicion = !!id;

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [stock, setStock] = useState('0');
  const [categoriaIds, setCategoriaIds] = useState<string[]>([]);

  const [categorias, setCategorias] = useState<CategoriaDashboard[]>([]);
  const [cargando, setCargando] = useState(esEdicion);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar categorías disponibles
  useEffect(() => {
    apiFetch<CategoriaDashboard[]>('/api/categories')
      .then(setCategorias)
      .catch(() => setCategorias([]));
  }, []);

  // Cargar datos del producto en modo edición
  useEffect(() => {
    if (!esEdicion) return;
    apiFetch<ProductoDashboard>(`/api/products/${id}`)
      .then((p) => {
        setNombre(p.nombre);
        setDescripcion(p.descripcion ?? '');
        setImagen(p.imagen ?? '');
        setPrecioUnitario(String(p.precioUnitario));
        setStock(String(p.stock));
        setCategoriaIds(p.category.map((c) => c.id));
      })
      .catch(() => setError('No se pudo cargar el producto.'))
      .finally(() => setCargando(false));
  }, [id, esEdicion]);

  const toggleCategoria = useCallback((catId: string) => {
    setCategoriaIds((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    const precio = parseFloat(precioUnitario);
    if (isNaN(precio) || precio <= 0) {
      setError('El precio debe ser un número mayor a 0.');
      return;
    }
    if (categoriaIds.length === 0) {
      setError('Debe seleccionar al menos una categoría.');
      return;
    }

    setEnviando(true);
    try {
      const body = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        imagen: imagen.trim() || undefined,
        precioUnitario: precio,
        stock: parseInt(stock) || 0,
        category: categoriaIds,
      };

      if (esEdicion) {
        await apiFetch(`/api/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch('/api/dashboard/products', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }

      router.push('/dashboard/productos');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el producto.';
      setError(msg);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <p className={styles.estado}>Cargando...</p>;

  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>{esEdicion ? 'Editar producto' : 'Nuevo producto'}</h1>

      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.campo}>
          <label htmlFor="nombre">Nombre *</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Teclado mecánico RGB"
            required
            minLength={3}
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción opcional del producto..."
            maxLength={500}
            rows={3}
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="imagen">URL de la imagen</label>
          <input
            id="imagen"
            type="url"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            placeholder="https://..."
            maxLength={500}
          />
          {imagen.trim() && (
            <img
              src={imagen.trim()}
              alt="Vista previa"
              className={styles.previewImagen}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>

        <div className={styles.fila}>
          <div className={styles.campo}>
            <label htmlFor="precio">Precio unitario ($) *</label>
            <input
              id="precio"
              type="number"
              value={precioUnitario}
              onChange={(e) => setPrecioUnitario(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className={styles.campo}>
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
            />
          </div>
        </div>

        <div className={styles.campo}>
          <label>Categorías * <span className={styles.hint}>(seleccioná al menos una)</span></label>
          <div className={styles.checkboxGrilla}>
            {categorias.length === 0 ? (
              <p className={styles.sinCategorias}>No hay categorías disponibles.</p>
            ) : (
              categorias.map((cat) => (
                <label key={cat.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={categoriaIds.includes(cat.id)}
                    onChange={() => toggleCategoria(cat.id)}
                  />
                  {cat.nombre}
                </label>
              ))
            )}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.botones}>
          <button
            type="button"
            onClick={() => router.push('/dashboard/productos')}
            className={styles.botonCancelar}
          >
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className={styles.botonGuardar}>
            {enviando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </div>
  );
}
