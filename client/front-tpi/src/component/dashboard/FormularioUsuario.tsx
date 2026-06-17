'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import type { UsuarioDashboard, RolResumen } from '@/lib/dashboard-types';
import styles from './FormularioProducto.module.css'; // Reutiliza los estilos del dashboard

interface Props {
  id?: string;
}

export default function FormularioUsuario({ id }: Props) {
  const router = useRouter();
  const esEdicion = !!id;

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [activo, setActivo] = useState(true);
  const [rolesSeleccionados, setRolesSeleccionados] = useState<string[]>([]);

  const [rolesDisponibles, setRolesDisponibles] = useState<RolResumen[]>([]);
  const [cargando, setCargando] = useState(esEdicion);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga los roles disponibles
  useEffect(() => {
    apiFetch<RolResumen[]>('/api/roles')
      .then(setRolesDisponibles)
      .catch(() => setRolesDisponibles([]));
  }, []);

  // Precarga datos del usuario en modo edición
  useEffect(() => {
    if (!esEdicion) return;
    apiFetch<UsuarioDashboard>(`/api/users/${id}`)
      .then((u) => {
        setNombre(u.nombre);
        setApellido(u.apellido);
        setEmail(u.email);
        setTelefono(u.telefono ?? '');
        setActivo(u.activo);
        setRolesSeleccionados(u.roles.map((r) => r.id));
        // La fecha viene como ISO string; tomamos solo la parte de fecha
        const fechaRaw = (u as unknown as { fechaNacimiento?: string }).fechaNacimiento;
        if (fechaRaw) setFechaNacimiento(fechaRaw.slice(0, 10));
      })
      .catch(() => setError('No se pudo cargar el usuario.'))
      .finally(() => setCargando(false));
  }, [id, esEdicion]);

  const toggleRol = (rolId: string) => {
    setRolesSeleccionados((prev) =>
      prev.includes(rolId) ? prev.filter((r) => r !== rolId) : [...prev, rolId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    if (apellido.trim().length < 2) {
      setError('El apellido debe tener al menos 2 caracteres.');
      return;
    }
    if (!esEdicion && password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setEnviando(true);
    try {
      if (esEdicion) {
        const body: Record<string, unknown> = {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          activo,
          roles: rolesSeleccionados,
        };
        if (telefono.trim()) body.telefono = telefono.trim();
        if (password.trim()) body.password = password.trim();
        if (fechaNacimiento) body.fechaNacimiento = new Date(fechaNacimiento);

        await apiFetch(`/api/dashboard/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        const body = {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          password: password.trim(),
          fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
          telefono: telefono.trim() || undefined,
          roles: rolesSeleccionados,
        };
        await apiFetch('/api/dashboard/users', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }

      router.push('/dashboard/usuarios');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el usuario.';
      setError(msg);
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <p className={styles.estado}>Cargando...</p>;

  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>{esEdicion ? 'Editar usuario' : 'Nuevo usuario'}</h1>

      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.fila}>
          <div className={styles.campo}>
            <label htmlFor="nombre">Nombre *</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Juan"
              required
              minLength={2}
            />
          </div>
          <div className={styles.campo}>
            <label htmlFor="apellido">Apellido *</label>
            <input
              id="apellido"
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Ej: Pérez"
              required
              minLength={2}
            />
          </div>
        </div>

        <div className={styles.campo}>
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@ejemplo.com"
            required
          />
        </div>

        <div className={styles.fila}>
          <div className={styles.campo}>
            <label htmlFor="password">
              {esEdicion ? 'Nueva contraseña' : 'Contraseña *'}
              {esEdicion && <span className={styles.hint}> (dejar vacío para no cambiar)</span>}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={esEdicion ? 'Sin cambios' : 'Mínimo 6 caracteres'}
              minLength={esEdicion ? 0 : 6}
              required={!esEdicion}
              autoComplete="new-password"
            />
          </div>
          <div className={styles.campo}>
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="10 dígitos (sin 0 ni 15)"
              maxLength={10}
            />
          </div>
        </div>

        <div className={styles.campo}>
          <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
          <input
            id="fechaNacimiento"
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
          />
        </div>

        {/* Roles */}
        <div className={styles.campo}>
          <label>Roles</label>
          {rolesDisponibles.length === 0 ? (
            <p className={styles.sinCategorias}>No hay roles disponibles.</p>
          ) : (
            <div className={styles.checkboxGrilla}>
              {rolesDisponibles.map((rol) => (
                <label key={rol.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={rolesSeleccionados.includes(rol.id)}
                    onChange={() => toggleRol(rol.id)}
                  />
                  {rol.nombre}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Estado activo — solo en modo edición */}
        {esEdicion && (
          <div className={styles.campo}>
            <label className={styles.checkboxItem}>
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
              />
              Usuario activo
            </label>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.botones}>
          <button
            type="button"
            className={styles.botonCancelar}
            onClick={() => router.push('/dashboard/usuarios')}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.botonGuardar}
            disabled={enviando}
          >
            {enviando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </div>
  );
}
