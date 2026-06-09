"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import {useAuth} from "@/context/AuthContext";
import { useRouter } from 'next/navigation';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
    const {login}= useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
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

    return Object.keys(newErrors).length === 0;
  };
  function onSuccess(){
    router.push('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      await login(email.trim(), password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
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
          </div>
        {error && (
            <div className="login-gate-error" role="alert">
              {error}
            </div>
          )}
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