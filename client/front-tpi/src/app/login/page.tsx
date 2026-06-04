"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Ingrese un email válido";
    }

    if (!password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    console.log("Login:", {
      email,
      password,
    });

    alert("Login válido");
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Bienvenido</h1>
          <p className={styles.subtitle}>
            Inicia sesión para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {errors.email && (
              <span className={styles.error}>
                {errors.email}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Contraseña</label>

            <input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {errors.password && (
              <span className={styles.error}>
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={styles.button}
          >
            Iniciar sesión
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            ¿No tienes cuenta?{" "}
            <Link href="/register">
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}