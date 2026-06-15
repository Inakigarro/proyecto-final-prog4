'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import type { ProductoDashboard, PromocionDashboard, TipoPromocion } from '@/lib/dashboard-types';
import styles from './FormularioPromocion.module.css';

const TIPOS: { valor: TipoPromocion; etiqueta: string }[] = [
  { valor: 'DESCUENTO_PORCENTUAL', etiqueta: 'Descuento porcentual' },
  { valor: 'NXM',                 etiqueta: 'N por M (ej: 3x2)' },
  { valor: 'SEGUNDA_UNIDAD',      etiqueta: 'Segunda unidad con descuento' },
];

interface Props {
  id?: string;
}

export default function FormularioPromocion({ id }: Props) {
  const router = useRouter();
  const esEdicion = !!id;

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<TipoPromocion>('DESCUENTO_PORCENTUAL');
  const [porcentaje, setPorcentaje] = useState('');
  const [cantidadLleva, setCantidadLleva] = useState('');
  const [cantidadPaga, setCantidadPaga] = useState('');
  const [descuentoSegunda, setDescuentoSegunda] = useState('');
  const [productoIds, setProductoIds] = useState<string[]>([]);
  const [activo, setActivo] = useState(true);

  const [productos, setProductos] = useState<ProductoDashboard[]>([]);
  const [cargando, setCargando] = useState(esEdicion);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar lista de productos disponibles
  useEffect(() => {
    apiFetch<{ datos: ProductoDashboard[] }>('/api/dashboard/products?limite=100')
      .then((res) => setProductos(res.datos))
      .catch(() => setProductos([]));
  }, []);

  // Cargar datos en modo edición
  useEffect(() => {
    if (!esEdicion) return;
    apiFetch<PromocionDashboard>(`/api/promotions/${id}`)
      .then((p) => {
        setNombre(p.nombrePromocion);
        setTipo(p.tipoPromocion);
        setProductoIds(p.idsProductos);
        const params = p.parametros;
        if (params.porcentaje !== undefined)            setPorcentaje(String(params.porcentaje));
        if (params.cantidadLleva !== undefined)         setCantidadLleva(String(params.cantidadLleva));
        if (params.cantidadPaga !== undefined)          setCantidadPaga(String(params.cantidadPaga));
        if (params.descuentoSegundaUnidad !== undefined) setDescuentoSegunda(String(params.descuentoSegundaUnidad));
      })
      .catch(() => setError('No se pudo cargar la promoción.'))
      .finally(() => setCargando(false));
  }, [id, esEdicion]);

  const toggleProducto = useCallback((prodId: string) => {
    setProductoIds((prev) =>
      prev.includes(prodId) ? prev.filter((p) => p !== prodId) : [...prev, prodId]
    );
  }, []);

  const construirParametros = () => {
    switch (tipo) {
      case 'DESCUENTO_PORCENTUAL':
        return { porcentaje: parseFloat(porcentaje) };
      case 'NXM':
        return { cantidadLleva: parseInt(cantidadLleva), cantidadPaga: parseInt(cantidadPaga) };
      case 'SEGUNDA_UNIDAD':
        return { descuentoSegundaUnidad: parseFloat(descuentoSegunda) };
    }
  };

  const validar = (): string | null => {
    if (nombre.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    if (tipo === 'DESCUENTO_PORCENTUAL') {
      const v = parseFloat(porcentaje);
      if (isNaN(v) || v <= 0 || v > 100) return 'El porcentaje debe ser entre 1 y 100.';
    }
    if (tipo === 'NXM') {
      const lleva = parseInt(cantidadLleva);
      const paga = parseInt(cantidadPaga);
      if (isNaN(lleva) || lleva < 2) return 'La cantidad que lleva debe ser al menos 2.';
      if (isNaN(paga) || paga < 1) return 'La cantidad que paga debe ser al menos 1.';
      if (paga >= lleva) return 'La cantidad que paga debe ser menor a la que lleva.';
    }
    if (tipo === 'SEGUNDA_UNIDAD') {
      const v = parseFloat(descuentoSegunda);
      if (isNaN(v) || v <= 0 || v > 100) return 'El descuento debe ser entre 1 y 100.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validacionError = validar();
    if (validacionError) { setError(validacionError); return; }

    setEnviando(true);
    try {
      const body = {
        nombre: nombre.trim(),
        tipo,
        parametros: construirParametros(),
        productos: productoIds,
        ...(esEdicion ? { activo } : {}),
      };

      if (esEdicion) {
        await apiFetch(`/api/promotions/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch('/api/dashboard/promotions', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }

      router.push('/dashboard/promociones');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la promoción.';
      setError(msg);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <p className={styles.estado}>Cargando...</p>;

  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>{esEdicion ? 'Editar promoción' : 'Nueva promoción'}</h1>

      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.campo}>
          <label htmlFor="nombre">Nombre *</label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Descuento de verano"
            required
            minLength={3}
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="tipo">Tipo de promoción *</label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoPromocion)}
          >
            {TIPOS.map(({ valor, etiqueta }) => (
              <option key={valor} value={valor}>{etiqueta}</option>
            ))}
          </select>
        </div>

        {/* Parámetros dinámicos según tipo */}
        {tipo === 'DESCUENTO_PORCENTUAL' && (
          <div className={styles.campo}>
            <label htmlFor="porcentaje">Porcentaje de descuento (%) *</label>
            <input
              id="porcentaje"
              type="number"
              value={porcentaje}
              onChange={(e) => setPorcentaje(e.target.value)}
              placeholder="Ej: 15"
              min="1"
              max="100"
              step="0.01"
              required
            />
          </div>
        )}

        {tipo === 'NXM' && (
          <div className={styles.fila}>
            <div className={styles.campo}>
              <label htmlFor="lleva">Cantidad que lleva *</label>
              <input
                id="lleva"
                type="number"
                value={cantidadLleva}
                onChange={(e) => setCantidadLleva(e.target.value)}
                placeholder="Ej: 3"
                min="2"
                step="1"
                required
              />
            </div>
            <div className={styles.campo}>
              <label htmlFor="paga">Cantidad que paga *</label>
              <input
                id="paga"
                type="number"
                value={cantidadPaga}
                onChange={(e) => setCantidadPaga(e.target.value)}
                placeholder="Ej: 2"
                min="1"
                step="1"
                required
              />
            </div>
          </div>
        )}

        {tipo === 'SEGUNDA_UNIDAD' && (
          <div className={styles.campo}>
            <label htmlFor="descuentoSegunda">Descuento en la 2ª unidad (%) *</label>
            <input
              id="descuentoSegunda"
              type="number"
              value={descuentoSegunda}
              onChange={(e) => setDescuentoSegunda(e.target.value)}
              placeholder="Ej: 50"
              min="1"
              max="100"
              step="0.01"
              required
            />
          </div>
        )}

        <div className={styles.campo}>
          <label>Productos incluidos <span className={styles.hint}>(opcional)</span></label>
          <div className={styles.checkboxGrilla}>
            {productos.length === 0 ? (
              <p className={styles.sinItems}>No hay productos disponibles.</p>
            ) : (
              productos.map((prod) => (
                <label key={prod.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={productoIds.includes(prod.id)}
                    onChange={() => toggleProducto(prod.id)}
                  />
                  {prod.nombre}
                </label>
              ))
            )}
          </div>
        </div>

        {esEdicion && (
          <div className={styles.campoActivo}>
            <label className={styles.checkboxItem}>
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
              />
              Promoción activa
            </label>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.botones}>
          <button
            type="button"
            onClick={() => router.push('/dashboard/promociones')}
            className={styles.botonCancelar}
          >
            Cancelar
          </button>
          <button type="submit" disabled={enviando} className={styles.botonGuardar}>
            {enviando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear promoción'}
          </button>
        </div>
      </form>
    </div>
  );
}
