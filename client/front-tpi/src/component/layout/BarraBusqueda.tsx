"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./BarraBusqueda.module.css";

const BarraBusqueda = () => {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    const limpio = busqueda.trim();
    if (!limpio) return;
    router.push(`/search-result?query=${encodeURIComponent(limpio)}`);
    setBusqueda("");
  };

  return (
    <form className={styles.formulario} role="search" onSubmit={enviar}>
      <input
        type="search"
        placeholder="Buscar..."
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
        aria-label="Buscar productos"
      />
    </form>
  );
};

export default BarraBusqueda;
