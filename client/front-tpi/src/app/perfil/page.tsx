'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { apiFetch } from "@/lib/api";
import styles from "./page.module.css";

interface FormErrors {
  nombre?: string;
  apellido?: string;
  email?: string;
  general?: string;
}

export default function PerfilPage() {
  const { isAutenticado, isCargando, usuario } = useAppSelector((s) => s.auth);
  const router = useRouter();

  const [form, setForm] = useState({ nombre: "", apellido: "", email: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    // Esperar a que termine la hidratación antes de decidir si redirigir
    if (isCargando) return;
    if (!isAutenticado) {
      router.replace("/login?redirect=/perfil");
      return;
    }
    if (usuario) {
      setForm({ nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email });
    }
  }, [isCargando, isAutenticado, usuario, router]);

  const actualizar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
    setExito(false);
  };

  const validar = (): boolean => {
    const nuevos: FormErrors = {};

    if (form.nombre.trim().length < 2)
      nuevos.nombre = "El nombre debe tener al menos 2 caracteres.";

    if (form.apellido.trim().length < 2)
      nuevos.apellido = "El apellido debe tener al menos 2 caracteres.";

    if (!form.email.trim()) {
      nuevos.email = "El email es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      nuevos.email = "Ingresá un email válido.";
    }

    setErrors(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validar() || !usuario) return;

    setCargando(true);
    setExito(false);
    try {
      await apiFetch("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          email: form.email.trim(),
        }),
      });
      setExito(true);
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : "Error al guardar los cambios. Intentá de nuevo." });
    } finally {
      setCargando(false);
    }
  };

  if (isCargando || !usuario) return null;

  return (
    <main className={styles.contenedor}>
      <div className={styles.tarjeta}>
        <div className={styles.encabezado}>
          <h1 className={styles.titulo}>Editar perfil</h1>
          <p className={styles.subtitulo}>Actualizá tus datos personales</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className={styles.formulario}>
          {errors.general && (
            <p className={styles.errorGeneral} role="alert">{errors.general}</p>
          )}
          {exito && (
            <p className={styles.mensajeExito} role="status">Cambios guardados correctamente.</p>
          )}

          <div className={styles.fila}>
            <div className={styles.campo}>
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={actualizar}
                autoComplete="given-name"
              />
              {errors.nombre && <p className={styles.error}>{errors.nombre}</p>}
            </div>

            <div className={styles.campo}>
              <label htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                value={form.apellido}
                onChange={actualizar}
                autoComplete="family-name"
              />
              {errors.apellido && <p className={styles.error}>{errors.apellido}</p>}
            </div>
          </div>

          <div className={styles.campo}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={actualizar}
              autoComplete="email"
            />
            {errors.email && <p className={styles.error}>{errors.email}</p>}
          </div>

          <button type="submit" className={styles.botonSubmit} disabled={cargando}>
            {cargando ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </main>
  );
}
