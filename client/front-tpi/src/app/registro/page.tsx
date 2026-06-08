'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type RegistrarInput } from "@/context/AuthContext";
import styles from "./page.module.css";

interface FormErrors {
  nombre?: string;
  apellido?: string;
  email?: string;
  password?: string;
  confirmarPassword?: string;
  fechaNacimiento?: string;
  general?: string;
}

/** Convierte "YYYY-MM-DD" (valor del input date) a "dd/MM/YYYY" (formato del backend). */
function convertirFecha(valor: string): string {
  const [anio, mes, dia] = valor.split("-");
  return `${dia}/${mes}/${anio}`;
}

const REQUISITOS_PASSWORD = [
  { label: "Mínimo 8 caracteres",      check: (p: string) => p.length >= 8 },
  { label: "Una letra mayúscula",       check: (p: string) => /[A-Z]/.test(p) },
  { label: "Una letra minúscula",       check: (p: string) => /[a-z]/.test(p) },
  { label: "Un número",                 check: (p: string) => /[0-9]/.test(p) },
  { label: "Un símbolo especial",       check: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

/** Replica la validación de complejidad del backend. */
function validarPassword(password: string): boolean {
  return REQUISITOS_PASSWORD.every(({ check }) => check(password));
}

export default function RegistroPage() {
  const { registrar, login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmarPassword: "",
    fechaNacimiento: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [cargando, setCargando] = useState(false);

  const actualizar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpiar el error del campo al escribir
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
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

    if (!form.password) {
      // Error visible solo cuando está completamente vacío (el checklist cubre el resto)
      nuevos.password = "La contraseña es obligatoria.";
    } else if (!validarPassword(form.password)) {
      // No se muestra mensaje: el checklist ya indica qué falta
      nuevos.password = "";
    }

    if (form.password !== form.confirmarPassword) {
      nuevos.confirmarPassword = "Las contraseñas no coinciden.";
    }

    if (!form.fechaNacimiento) {
      nuevos.fechaNacimiento = "La fecha de nacimiento es obligatoria.";
    }

    setErrors(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validar()) return;

    setCargando(true);
    try {
      const datos: RegistrarInput = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        password: form.password,
        fechaNacimiento: convertirFecha(form.fechaNacimiento),
      };

      await registrar(datos);
      await login(datos.email, datos.password);
      router.push("/");
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : "Error al registrarse. Intentá de nuevo." });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.contenedor}>
      <h1 className={styles.titulo}>Crear cuenta</h1>

      <form onSubmit={handleSubmit} noValidate>
        {errors.general && (
          <p className={styles.errorGeneral} role="alert">{errors.general}</p>
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
              placeholder="Juan"
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
              placeholder="Pérez"
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
            placeholder="juan@ejemplo.com"
            autoComplete="email"
          />
          {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>

        <div className={styles.campo}>
          <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
          <input
            id="fechaNacimiento"
            name="fechaNacimiento"
            type="date"
            value={form.fechaNacimiento}
            onChange={actualizar}
            autoComplete="bday"
          />
          {errors.fechaNacimiento && (
            <p className={styles.error}>{errors.fechaNacimiento}</p>
          )}
        </div>

        <div className={styles.campo}>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={actualizar}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            aria-describedby="requisitos-password"
          />
          {form.password.length > 0 && (
            <ul
              id="requisitos-password"
              className={styles.requisitos}
              aria-label="Requisitos de la contraseña"
            >
              {REQUISITOS_PASSWORD.map(({ label, check }) => {
                const cumplido = check(form.password);
                return (
                  <li
                    key={label}
                    className={cumplido ? styles.requisitoCumplido : styles.requisitoFaltante}
                  >
                    <span aria-hidden="true">{cumplido ? "✓" : "✗"}</span> {label}
                  </li>
                );
              })}
            </ul>
          )}
          {errors.password && !form.password && (
            <p className={styles.error}>{errors.password}</p>
          )}
        </div>

        <div className={styles.campo}>
          <label htmlFor="confirmarPassword">Confirmá tu contraseña</label>
          <input
            id="confirmarPassword"
            name="confirmarPassword"
            type="password"
            value={form.confirmarPassword}
            onChange={actualizar}
            placeholder="Repetí la contraseña"
            autoComplete="new-password"
          />
          {errors.confirmarPassword && (
            <p className={styles.error}>{errors.confirmarPassword}</p>
          )}
        </div>

        <button type="submit" className={styles.botonSubmit} disabled={cargando}>
          {cargando ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
