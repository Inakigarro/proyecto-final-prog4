'use client';

import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getAccessToken } from '@/lib/api';
import type { SlideDashboard, SlideUploadResponse } from '@/lib/dashboard-types';
import styles from './FormularioSlide.module.css';

interface FormularioSlideProps {
  /** Si se pasa, activa modo edición y precarga datos del slide. */
  id?: string;
}

/**
 * Formulario de alta/edición de un slide del home.
 *
 * La imagen se sube en dos pasos:
 *  1. Al elegir un archivo, se hace POST /api/dashboard/slides/imagen con FormData.
 *     El backend guarda el archivo en disco y devuelve la URL absoluta.
 *  2. La URL devuelta se persiste en el campo `imagen` al guardar el slide.
 *
 * Mostramos un preview cuando hay URL para que el dueño confirme visualmente
 * antes de confirmar la edición.
 */
export default function FormularioSlide({ id }: FormularioSlideProps) {
  const router = useRouter();
  const esEdicion = !!id;

  const [imagen, setImagen] = useState('');
  const [alt, setAlt] = useState('');
  const [leyenda, setLeyenda] = useState('');
  const [orden, setOrden] = useState('0');

  const [cargandoInicial, setCargandoInicial] = useState(esEdicion);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Precarga en modo edición
  useEffect(() => {
    if (!esEdicion) return;
    apiFetch<SlideDashboard>(`/api/slides/${id}`)
      .then((s) => {
        setImagen(s.imagen);
        setAlt(s.alt);
        setLeyenda(s.leyenda);
        setOrden(String(s.orden));
      })
      .catch(() => setError('No se pudo cargar el slide.'))
      .finally(() => setCargandoInicial(false));
  }, [id, esEdicion]);

  const handleArchivo = async (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setError(null);
    setSubiendoImagen(true);
    try {
      const formData = new FormData();
      formData.append('imagen', archivo);

      // apiFetch agrega Content-Type: application/json; para multipart hay que
      // hacer fetch manual y NO setear Content-Type (el browser arma el boundary).
      const token = getAccessToken();
      const respuesta = await fetch('/api/slides/imagen', {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!respuesta.ok) {
        const data = await respuesta.json().catch(() => ({})) as { message?: string };
        throw new Error(data.message ?? 'No se pudo subir la imagen');
      }

      const data = (await respuesta.json()) as SlideUploadResponse;
      setImagen(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!imagen) {
      setError('Tenés que subir una imagen.');
      return;
    }
    if (alt.trim().length < 2) {
      setError('El texto alternativo debe tener al menos 2 caracteres.');
      return;
    }
    if (leyenda.trim().length < 2) {
      setError('La leyenda debe tener al menos 2 caracteres.');
      return;
    }
    const ordenNumerico = parseInt(orden, 10);
    if (Number.isNaN(ordenNumerico) || ordenNumerico < 0) {
      setError('El orden tiene que ser un número entero mayor o igual a 0.');
      return;
    }

    setEnviando(true);
    try {
      const body = {
        imagen,
        alt: alt.trim(),
        leyenda: leyenda.trim(),
        orden: ordenNumerico,
      };

      if (esEdicion) {
        await apiFetch(`/api/slides/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch('/api/slides', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }

      router.push('/dashboard/slider');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el slide.';
      setError(msg);
    } finally {
      setEnviando(false);
    }
  };

  if (cargandoInicial) return <p className={styles.estado}>Cargando...</p>;

  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>{esEdicion ? 'Editar slide' : 'Nuevo slide'}</h1>

      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.campo}>
          <label htmlFor="imagen">Imagen *</label>
          <input
            id="imagen"
            type="file"
            accept="image/*"
            onChange={handleArchivo}
            disabled={subiendoImagen}
          />
          <span className={styles.hint}>
            JPG, PNG o WEBP. Tamaño máximo 5 MB. La imagen se sube al servidor y
            se reemplaza la actual si elegís otra.
          </span>
          {subiendoImagen && <p className={styles.subiendo}>Subiendo imagen...</p>}
          {imagen && (
            <div className={styles.preview}>
              <img
                src={imagen}
                alt="Vista previa"
                className={styles.previewImagen}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className={styles.previewUrl}>{imagen}</span>
            </div>
          )}
        </div>

        <div className={styles.campo}>
          <label htmlFor="alt">Texto alternativo *</label>
          <input
            id="alt"
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Ej: Banner de ofertas de tecnología"
            maxLength={120}
            required
            minLength={2}
          />
          <span className={styles.hint}>
            Para accesibilidad: describe brevemente lo que se ve en la imagen.
          </span>
        </div>

        <div className={styles.campo}>
          <label htmlFor="leyenda">Leyenda *</label>
          <input
            id="leyenda"
            type="text"
            value={leyenda}
            onChange={(e) => setLeyenda(e.target.value)}
            placeholder="Ej: Las mejores ofertas en tecnología"
            maxLength={200}
            required
            minLength={2}
          />
          <span className={styles.hint}>
            Texto que aparece sobre la imagen en el slider del home.
          </span>
        </div>

        <div className={styles.campo}>
          <label htmlFor="orden">Orden *</label>
          <input
            id="orden"
            type="number"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            min="0"
            step="1"
            required
          />
          <span className={styles.hint}>
            Los slides se muestran de menor a mayor. Usalo para definir el orden.
          </span>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.botones}>
          <button
            type="button"
            onClick={() => router.push('/dashboard/slider')}
            className={styles.botonCancelar}
            disabled={enviando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.botonGuardar}
            disabled={enviando || subiendoImagen}
          >
            {enviando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear slide'}
          </button>
        </div>
      </form>
    </div>
  );
}
